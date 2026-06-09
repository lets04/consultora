<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Curso;
use App\Models\Inscripcion;
use App\Models\InscripcionCurso;
use App\Models\Promocion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogController extends Controller
{
    public function listPromotions(Request $request): JsonResponse
    {
        $onlyActive = $request->query('active') === 'true';

        $rows = Promocion::with('cursos')
            ->when($onlyActive, fn ($q) => $q->where('activa', true))
            ->withCount('inscripciones')
            ->orderByDesc('id')
            ->get();

        return response()->json($rows->map(fn ($row) => [
            'id' => $row->id,
            'titulo' => $row->nombre,
            'periodo' => $row->periodo,
            'activa' => $row->activa,
            'inscripcionesCount' => $row->inscripciones_count,
            'cursos' => $row->cursos->map(fn ($curso) => [
                'id' => $curso->id,
                'nombre' => $curso->nombre,
            ])->values(),
        ]));
    }

    public function createPromotion(Request $request): JsonResponse
    {
        $titulo = $request->input('titulo');
        $cursos = $request->input('cursos', []);

        if (!$titulo || !is_array($cursos) || count($cursos) === 0) {
            return response()->json(['message' => 'Datos incompletos'], 400);
        }

        $cursosNumericos = collect($cursos)->every(fn ($c) => is_numeric($c));
        $cursoRecords = Curso::when(
            $cursosNumericos,
            fn ($q) => $q->whereIn('id', $cursos),
            fn ($q) => $q->whereIn('nombre', $cursos)
        )->get(['id']);

        if ($cursoRecords->count() !== count($cursos)) {
            return response()->json(['message' => 'Algunos cursos no existen'], 400);
        }

        $promocion = Promocion::create([
            'nombre' => $titulo,
            'periodo' => '',
            'activa' => true,
            'creado_en' => now(),
        ]);

        $promocion->cursos()->attach($cursoRecords->pluck('id'));

        return response()->json(['id' => $promocion->id], 201);
    }

    public function updatePromotion(Request $request, int $id): JsonResponse
    {
        $titulo = $request->input('titulo');
        $cursos = $request->input('cursos', []);

        if (!$titulo || !is_array($cursos) || count($cursos) === 0) {
            return response()->json(['message' => 'Datos incompletos'], 400);
        }

        $uniqueCourseIds = collect($cursos)->map(fn ($c) => (int) $c)->filter()->unique()->values();
        $cursoRecords = Curso::whereIn('id', $uniqueCourseIds)->get(['id']);

        if ($cursoRecords->count() !== $uniqueCourseIds->count()) {
            return response()->json(['message' => 'Algunos cursos no existen'], 400);
        }

        $promocion = Promocion::find($id);
        if (!$promocion) {
            return response()->json(['message' => 'Promoción no encontrada'], 404);
        }

        DB::transaction(function () use ($promocion, $titulo, $uniqueCourseIds) {
            $promocion->update(['nombre' => $titulo]);
            $promocion->cursos()->sync($uniqueCourseIds->all());
        });

        return response()->json(['id' => $id]);
    }

    public function updatePromotionStatus(Request $request, int $id): JsonResponse
    {
        $activa = $request->input('activa');
        if (!is_bool($activa)) {
            return response()->json(['message' => 'Estado requerido'], 400);
        }

        $promocion = Promocion::find($id);
        if (!$promocion) {
            return response()->json(['message' => 'Promoción no encontrada'], 404);
        }

        $promocion->update(['activa' => $activa]);

        return response()->json([
            'id' => $promocion->id,
            'titulo' => $promocion->nombre,
            'periodo' => $promocion->periodo,
            'activa' => $promocion->activa,
        ]);
    }

    public function deletePromotion(int $id): JsonResponse
    {
        $promocion = Promocion::find($id);
        if (!$promocion) {
            return response()->json(['message' => 'Promoción no encontrada'], 404);
        }

        if (Inscripcion::where('promocion_id', $id)->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar una promoción con inscripciones registradas',
            ], 400);
        }

        DB::transaction(function () use ($promocion) {
            $promocion->cursos()->detach();
            $promocion->delete();
        });

        return response()->noContent();
    }

    public function listAreas(): JsonResponse
    {
        $rows = Area::with('cursos')->orderBy('id')->get();

        return response()->json($rows->map(fn ($row) => [
            'id' => $row->id,
            'nombre' => $row->nombre,
            'color' => $row->color,
            'cursos' => $row->cursos->map(fn ($curso) => [
                'id' => $curso->id,
                'nombre' => $curso->nombre,
            ])->values(),
        ]));
    }

    public function createArea(Request $request): JsonResponse
    {
        $nombre = $request->input('nombre');
        $color = $request->input('color');

        if (!$nombre || !$color) {
            return response()->json(['message' => 'Nombre y color requeridos'], 400);
        }

        $area = Area::create(['nombre' => $nombre, 'color' => $color]);

        return response()->json($area, 201);
    }

    public function updateArea(Request $request, int $id): JsonResponse
    {
        $nombre = $request->input('nombre');
        $color = $request->input('color');

        if (!$nombre || !$color) {
            return response()->json(['message' => 'Nombre y color requeridos'], 400);
        }

        $area = Area::find($id);
        if (!$area) {
            return response()->json(['message' => 'Área no encontrada'], 404);
        }

        $area->update(['nombre' => $nombre, 'color' => $color]);

        return response()->json($area);
    }

    public function deleteArea(int $id): JsonResponse
    {
        $area = Area::find($id);
        if (!$area) {
            return response()->json(['message' => 'Área no encontrada'], 404);
        }

        $area->delete();

        return response()->noContent();
    }

    public function createCurso(Request $request): JsonResponse
    {
        $areaId = $request->input('areaId');
        $nombre = $request->input('nombre');

        if (!$areaId || !$nombre) {
            return response()->json(['message' => 'areaId y nombre requeridos'], 400);
        }

        try {
            $curso = Curso::create([
                'nombre' => $nombre,
                'area_id' => $areaId,
            ]);

            return response()->json($curso, 201);
        } catch (\Throwable) {
            return response()->json(['message' => 'Error al crear curso'], 400);
        }
    }

    public function updateCurso(Request $request, int $id): JsonResponse
    {
        $nombre = $request->input('nombre');
        if (!$nombre) {
            return response()->json(['message' => 'Nombre requerido'], 400);
        }

        $curso = Curso::find($id);
        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        $curso->update(['nombre' => $nombre]);

        return response()->json($curso);
    }

    public function deleteCurso(int $id): JsonResponse
    {
        $curso = Curso::find($id);
        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        if (InscripcionCurso::where('curso_id', $id)->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar un curso con inscripciones registradas',
            ], 400);
        }

        DB::transaction(function () use ($curso) {
            DB::table('promocion_curso')->where('curso_id', $curso->id)->delete();
            $curso->delete();
        });

        return response()->noContent();
    }
}
