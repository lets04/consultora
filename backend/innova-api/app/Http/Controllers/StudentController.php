<?php

namespace App\Http\Controllers;

use App\Models\Certificado;
use App\Models\Empresa;
use App\Models\Estudiante;
use App\Models\Inscripcion;
use App\Models\InscripcionCurso;
use App\Models\Pago;
use App\Support\DateFormat;
use App\Support\PagoHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    private function mapEstudianteToDto(Estudiante $estudiante): array
    {
        $latest = $estudiante->inscripciones->sortByDesc('creado_en')->first();

        return [
            'id' => $estudiante->id,
            'nombre' => $estudiante->nombres.' '.$estudiante->apellidos,
            'ci' => $estudiante->ci,
            'tipoInscripcion' => $latest?->tipo,
            'curso' => $latest?->cursos->first()?->curso?->nombre ?? 'Sin curso',
            'inscripcion' => $latest ? DateFormat::es($latest->creado_en) : 'N/A',
            'pago' => $latest
                ? PagoHelper::status($latest->monto_total, $latest->monto_pagado)
                : 'pendiente',
            'registro' => DateFormat::es($estudiante->creado_en),
            'adminEmail' => $latest?->user?->email,
        ];
    }

    private function mapEstudianteToDetailDto(Estudiante $estudiante): array
    {
        $latest = $estudiante->inscripciones->sortByDesc('creado_en')->first();

        $cursos = $estudiante->inscripciones->flatMap(function ($inscripcion) {
            return $inscripcion->cursos->map(fn ($item) => [
                'id' => $item->id,
                'nombre' => $item->curso->nombre,
                'area' => $item->curso->area->nombre,
                'modalidad' => $inscripcion->modalidad ?? 'certificado',
                'estado' => $inscripcion->estado,
                'inicio' => DateFormat::es($inscripcion->creado_en),
                'nota' => $item->nota ?? 0,
                'tipo' => $inscripcion->tipo === 'promocion' ? 'promocion' : 'curso',
                'nombrePromocion' => $inscripcion->promocion?->nombre,
            ]);
        })->values()->all();

        return [
            'id' => $estudiante->id,
            'nombre' => $estudiante->nombres.' '.$estudiante->apellidos,
            'ci' => $estudiante->ci,
            'prefijo' => $estudiante->prefijo,
            'profesion' => $estudiante->profesion,
            'tipoInscripcion' => $latest?->tipo,
            'promocionNombre' => $latest?->promocion?->nombre,
            'curso' => $latest?->tipo === 'promocion'
                ? ($latest?->promocion?->nombre ?? 'Promoción')
                : ($latest?->cursos->first()?->curso?->nombre ?? 'Sin curso'),
            'inscripcion' => $latest ? DateFormat::es($latest->creado_en) : 'N/A',
            'pago' => $latest
                ? PagoHelper::status($latest->monto_total, $latest->monto_pagado)
                : 'pendiente',
            'telefono' => $estudiante->telefono ?? '',
            'email' => $estudiante->email ?? '',
            'departamento' => $estudiante->departamento ?? '',
            'cursos' => $cursos,
            'pagos' => $latest
                ? $latest->pagos->map(fn ($p) => [
                    'monto' => $p->monto,
                    'fecha' => DateFormat::es($p->fecha),
                    'tipoPago' => $p->tipo_pago,
                    'numeroComprobante' => $p->numero_comprobante,
                ])->values()->all()
                : [],
        ];
    }

    private function mapEstudianteToPortalDto(Estudiante $estudiante): array
    {
        $cursosPagados = $estudiante->inscripciones
            ->filter(fn ($i) => $i->monto_pagado >= $i->monto_total)
            ->flatMap(function ($inscripcion) {
                return $inscripcion->cursos->map(fn ($item) => [
                    'id' => $item->id,
                    'nombre' => $item->curso->nombre,
                    'area' => $item->curso->area->nombre,
                    'tipo' => $inscripcion->tipo === 'promocion' ? 'promocion' : 'curso',
                    'promocionNombre' => $inscripcion->promocion?->nombre,
                    'modalidad' => $inscripcion->modalidad ?? 'certificado',
                    'fechaInscripcion' => DateFormat::es($inscripcion->creado_en),
                    'nota' => $inscripcion->modalidad === 'examen' && $item->nota !== null
                        ? $item->nota
                        : null,
                ]);
            })
            ->values()
            ->all();

        return [
            'id' => $estudiante->id,
            'ci' => $estudiante->ci,
            'nombreCompleto' => $estudiante->nombres.' '.$estudiante->apellidos,
            'prefijo' => $estudiante->prefijo,
            'profesion' => $estudiante->profesion,
            'telefono' => $estudiante->telefono,
            'email' => $estudiante->email,
            'departamento' => $estudiante->departamento,
            'cursos' => $cursosPagados,
        ];
    }

    public function listStudents(): JsonResponse
    {
        $rows = Estudiante::with([
            'inscripciones' => fn ($q) => $q->orderByDesc('creado_en'),
            'inscripciones.user:id,email',
            'inscripciones.cursos.curso',
        ])->orderBy('nombres')->get();

        return response()->json($rows->map(fn ($e) => $this->mapEstudianteToDto($e))->values());
    }

    public function listCompletedStudents(Request $request): JsonResponse
    {
        $modalidadQuery = strtolower(trim((string) $request->query('modalidad', '')));
        $modalidadFilter = in_array($modalidadQuery, ['examen', 'certificado'], true)
            ? $modalidadQuery
            : null;

        $students = Estudiante::with([
            'inscripciones' => fn ($q) => $q->orderByDesc('creado_en'),
            'inscripciones.cursos.curso',
            'inscripciones.promocion',
        ])->orderBy('nombres')->get();

        $result = $students->map(function ($estudiante) use ($modalidadFilter) {
            $completed = $estudiante->inscripciones->filter(
                fn ($i) => $i->monto_pagado >= $i->monto_total
                    && (!$modalidadFilter || $i->modalidad === $modalidadFilter)
            );

            if ($completed->isEmpty()) {
                return null;
            }

            $inscription = $completed->first();
            $cursos = $inscription->cursos->map(fn ($c) => $c->curso->nombre)->all();
            $cursosTexto = count($cursos) > 2
                ? implode(', ', array_slice($cursos, 0, 2)).' +'.(count($cursos) - 2).' más'
                : (implode(', ', $cursos) ?: 'Sin curso');

            return [
                'id' => $estudiante->id,
                'nombre' => $estudiante->nombres.' '.$estudiante->apellidos,
                'ci' => $estudiante->ci,
                'registro' => DateFormat::es($estudiante->creado_en),
                'modalidad' => $inscription->modalidad ?? 'certificado',
                'curso' => $cursosTexto,
            ];
        })->filter()->values();

        return response()->json($result);
    }

    public function getStudentByCi(string $ci): JsonResponse
    {
        $estudiante = Estudiante::with([
            'inscripciones' => fn ($q) => $q->orderByDesc('creado_en'),
            'inscripciones.cursos.curso.area',
            'inscripciones.pagos',
            'inscripciones.promocion',
        ])->where('ci', $ci)->first();

        if (!$estudiante) {
            return response()->json(['message' => 'No encontrado'], 404);
        }

        return response()->json($this->mapEstudianteToDetailDto($estudiante));
    }

    public function getStudentPortalByCi(string $ci): JsonResponse
    {
        $ci = trim($ci);
        if ($ci === '') {
            return response()->json(['message' => 'CI requerido'], 400);
        }

        $estudiante = Estudiante::with([
            'inscripciones' => fn ($q) => $q->orderByDesc('creado_en'),
            'inscripciones.promocion',
            'inscripciones.cursos.curso.area',
        ])->where('ci', $ci)->first();

        if (!$estudiante) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }

        return response()->json($this->mapEstudianteToPortalDto($estudiante));
    }

    public function createStudent(Request $request): JsonResponse
    {
        $ci = $request->input('ci');
        $nombres = $request->input('nombres');
        $apellidos = $request->input('apellidos');

        if (!$ci || !$nombres || !$apellidos) {
            return response()->json(['message' => 'CI, nombres y apellidos son obligatorios'], 400);
        }

        if (Estudiante::where('ci', $ci)->exists()) {
            return response()->json(['message' => 'El estudiante ya existe'], 400);
        }

        $nuevo = Estudiante::create([
            'ci' => $ci,
            'nombres' => $nombres,
            'apellidos' => $apellidos,
            'prefijo' => $request->input('prefijo'),
            'profesion' => $request->input('profesion'),
            'telefono' => $request->input('telefono'),
            'email' => $request->input('email'),
            'departamento' => $request->input('departamento'),
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        return response()->json(['estudiante' => $nuevo], 201);
    }

    public function updateStudent(Request $request, string $ci): JsonResponse
    {
        $estudiante = Estudiante::where('ci', $ci)->first();
        if (!$estudiante) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }

        $estudiante->update([
            'nombres' => $request->input('nombres'),
            'apellidos' => $request->input('apellidos'),
            'prefijo' => $request->input('prefijo'),
            'profesion' => $request->input('profesion'),
            'telefono' => $request->input('telefono'),
            'email' => $request->input('email'),
            'departamento' => $request->input('departamento'),
            'actualizado_en' => now(),
        ]);

        return response()->json($estudiante);
    }

    public function deleteStudent(string $ci): JsonResponse
    {
        $estudiante = Estudiante::with('inscripciones:id,estudiante_id')->where('ci', $ci)->first();
        if (!$estudiante) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }

        foreach ($estudiante->inscripciones as $inscripcion) {
            Pago::where('inscripcion_id', $inscripcion->id)->delete();
            InscripcionCurso::where('inscripcion_id', $inscripcion->id)->delete();
            Certificado::where('inscripcion_id', $inscripcion->id)->delete();
            $inscripcion->delete();
        }

        $estudiante->delete();

        return response()->json(['message' => 'Estudiante eliminado']);
    }

    public function updateRegistroMinisterial(Request $request): JsonResponse
    {
        $registroMinisterial = $request->input('registroMinisterial');

        $empresa = Empresa::updateOrCreate(
            ['id' => 1],
            [
                'nombre' => 'CONSULTORA INNOVA',
                'registro_ministerial' => $registroMinisterial,
            ]
        );

        return response()->json($empresa);
    }

    public function getEmpresa(): JsonResponse
    {
        return response()->json(Empresa::first());
    }
}
