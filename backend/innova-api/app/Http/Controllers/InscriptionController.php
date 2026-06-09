<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Estudiante;
use App\Models\Inscripcion;
use App\Models\InscripcionCurso;
use App\Models\Promocion;
use App\Support\DateFormat;
use App\Support\PagoHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InscriptionController extends Controller
{
    private function mapInscripcionRow(Inscripcion $r): array
    {
        $total = $r->monto_total;
        $pagado = $r->monto_pagado;
        $saldo = $total - $pagado;
        $estadoPago = PagoHelper::status($total, $pagado);

        $cursos = $r->cursos->map(fn ($c) => $c->curso->nombre)->all();
        $cursosTexto = count($cursos) > 2
            ? implode(', ', array_slice($cursos, 0, 2)).' +'.(count($cursos) - 2).' más'
            : implode(', ', $cursos);

        return [
            'id' => $r->id,
            'estudiante' => $r->estudiante->nombres.' '.$r->estudiante->apellidos,
            'ci' => $r->estudiante->ci,
            'curso' => $r->tipo === 'promocion'
                ? ($r->promocion?->nombre ?? 'Promoción').': '.$cursosTexto
                : ($cursosTexto ?: 'Sin curso'),
            'tipo' => $r->tipo,
            'modalidad' => $r->modalidad === 'certificado' ? 'Certificado' : 'Examen',
            'fecha' => DateFormat::es($r->creado_en),
            'total' => $total,
            'pagado' => $pagado,
            'saldo' => $saldo,
            'estadoPago' => $estadoPago,
        ];
    }

    public function listInscriptions(): JsonResponse
    {
        $rows = Inscripcion::with(['estudiante', 'promocion', 'cursos.curso'])
            ->orderByDesc('creado_en')
            ->get();

        return response()->json($rows->map(fn ($r) => $this->mapInscripcionRow($r))->values());
    }

    public function listInscriptionsByAdmin(): JsonResponse
    {
        $rows = Inscripcion::with(['estudiante', 'user:id,email', 'promocion', 'cursos.curso'])
            ->orderByDesc('creado_en')
            ->get();

        $grouped = [];
        foreach ($rows as $r) {
            $adminEmail = $r->user?->email ?? 'Sin asignar';
            $grouped[$adminEmail][] = array_merge($this->mapInscripcionRow($r), [
                'estudianteCi' => $r->estudiante->ci,
            ]);
        }

        $stats = collect($grouped)->map(function ($inscripciones, $adminEmail) {
            return [
                'adminEmail' => $adminEmail,
                'totalInscripciones' => count($inscripciones),
                'totalMonto' => collect($inscripciones)->sum('total'),
                'totalPagado' => collect($inscripciones)->sum('pagado'),
                'pendiente' => collect($inscripciones)->where('estadoPago', 'pendiente')->count(),
                'parcial' => collect($inscripciones)->where('estadoPago', 'parcial')->count(),
                'pagado' => collect($inscripciones)->where('estadoPago', 'pagado')->count(),
                'inscripciones' => array_values($inscripciones),
            ];
        })->values();

        return response()->json($stats);
    }

    public function createInscription(Request $request): JsonResponse
    {
        $auth = $request->attributes->get('auth');
        $userId = $auth['userId'] ?? null;

        $studentCi = $request->input('studentCi');
        $tipo = $request->input('tipo');
        $cursoId = $request->input('cursoId');
        $promocionId = $request->input('promocionId');
        $modalidad = $request->input('modalidad');
        $montoTotal = $request->input('montoTotal');
        $cursosSeleccionados = $request->input('cursosSeleccionados', []);

        if (!$studentCi || !$tipo || !$modalidad || $montoTotal === null) {
            return response()->json(['message' => 'Datos incompletos'], 400);
        }

        $estudiante = Estudiante::where('ci', $studentCi)->first();
        if (!$estudiante) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }

        if ($tipo === 'promocion') {
            if (!$promocionId) {
                return response()->json(['message' => 'Promoción requerida'], 400);
            }

            $promocion = Promocion::with('cursos')->find($promocionId);
            if (!$promocion) {
                return response()->json(['message' => 'Promoción no encontrada'], 404);
            }
            if (!$promocion->activa) {
                return response()->json(['message' => 'La promoción está desactivada'], 400);
            }
            if ($promocion->cursos->isEmpty()) {
                return response()->json(['message' => 'La promoción no tiene cursos asignados'], 400);
            }

            $inscripcion = Inscripcion::create([
                'estudiante_id' => $estudiante->id,
                'user_id' => $userId,
                'tipo' => 'promocion',
                'promocion_id' => $promocionId,
                'modalidad' => $modalidad,
                'estado' => 'activo',
                'monto_total' => $montoTotal,
                'monto_pagado' => 0,
                'creado_en' => now(),
            ]);

            $cursosFinales = !empty($cursosSeleccionados)
                ? $cursosSeleccionados
                : $promocion->cursos->pluck('id')->all();

            foreach ($cursosFinales as $cid) {
                InscripcionCurso::create([
                    'inscripcion_id' => $inscripcion->id,
                    'curso_id' => $cid,
                ]);
            }

            return response()->json(['id' => $inscripcion->id], 201);
        }

        if ($tipo === 'individual') {
            if (!$cursoId) {
                return response()->json(['message' => 'Curso requerido'], 400);
            }

            $curso = Curso::find($cursoId);
            if (!$curso) {
                return response()->json(['message' => 'Curso no encontrado'], 404);
            }

            $inscripcion = Inscripcion::create([
                'estudiante_id' => $estudiante->id,
                'user_id' => $userId,
                'tipo' => 'individual',
                'modalidad' => $modalidad,
                'estado' => 'activo',
                'monto_total' => $montoTotal,
                'monto_pagado' => 0,
                'creado_en' => now(),
            ]);

            InscripcionCurso::create([
                'inscripcion_id' => $inscripcion->id,
                'curso_id' => $curso->id,
            ]);

            return response()->json(['id' => $inscripcion->id], 201);
        }

        return response()->json(['message' => 'Tipo de inscripción inválido'], 400);
    }

    public function updateNota(Request $request): JsonResponse
    {
        $id = $request->input('id');
        $nota = $request->input('nota');

        if ($id === null || $nota === null || $nota < 0 || $nota > 100) {
            return response()->json(['message' => 'Datos inválidos'], 400);
        }

        $item = InscripcionCurso::find($id);
        if (!$item) {
            return response()->json(['message' => 'Error al actualizar nota'], 500);
        }

        $item->update(['nota' => $nota]);

        return response()->json(['success' => true]);
    }

    public function updateModalidad(Request $request): JsonResponse
    {
        $id = $request->input('id');
        $modalidad = $request->input('modalidad');

        if ($id === null || !in_array($modalidad, ['certificado', 'examen'], true)) {
            return response()->json(['message' => 'Datos inválidos'], 400);
        }

        $inscripcion = Inscripcion::find($id);
        if (!$inscripcion) {
            return response()->json(['message' => 'Error al actualizar modalidad'], 500);
        }

        $inscripcion->update(['modalidad' => $modalidad]);

        return response()->json(['success' => true]);
    }
}
