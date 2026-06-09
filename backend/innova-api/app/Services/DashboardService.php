<?php

namespace App\Services;

use App\Models\Estudiante;
use App\Models\Inscripcion;
use App\Models\Pago;
use App\Models\Promocion;
use App\Models\Curso;
use App\Support\PagoHelper;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    private function startOfCurrentMonth(): Carbon
    {
        return Carbon::now()->startOfMonth();
    }

    public function buildAdminDashboard(): array
    {
        $totalEstudiantes = Estudiante::count();
        $inscripcionesRecientes = Inscripcion::with(['estudiante', 'cursos.curso'])
            ->orderByDesc('creado_en')
            ->limit(3)
            ->get();

        $cobradoMes = Pago::where('fecha', '>=', $this->startOfCurrentMonth())->sum('monto');
        $inscripcionesMes = Inscripcion::where('creado_en', '>=', $this->startOfCurrentMonth())
            ->get(['monto_total', 'monto_pagado']);

        $categorized = [
            'pagados' => 0,
            'parciales' => 0,
            'pendientes' => 0,
            'pendienteBs' => 0.0,
            'parcialBs' => 0.0,
        ];

        foreach ($inscripcionesMes as $item) {
            $status = PagoHelper::status($item->monto_total, $item->monto_pagado);
            if ($status === 'pagado') {
                $categorized['pagados']++;
            }
            if ($status === 'parcial') {
                $categorized['parciales']++;
                $categorized['parcialBs'] += max($item->monto_total - $item->monto_pagado, 0);
            }
            if ($status === 'pendiente') {
                $categorized['pendientes']++;
                $categorized['pendienteBs'] += max($item->monto_total - $item->monto_pagado, 0);
            }
        }

        return [
            'totalEstudiantes' => $totalEstudiantes,
            'pagoPendiente' => $categorized['pendientes'],
            'nuevosMes' => $inscripcionesMes->count(),
            'cobradoMes' => (float) $cobradoMes,
            'pendienteBs' => $categorized['pendienteBs'],
            'parcialBs' => $categorized['parcialBs'],
            'inscripcionesRecientes' => $inscripcionesRecientes->map(fn ($item) => [
                'nombre' => $item->estudiante->nombres.' '.$item->estudiante->apellidos,
                'curso' => $item->cursos->first()?->curso?->nombre ?? 'Sin curso',
                'pago' => PagoHelper::status($item->monto_total, $item->monto_pagado),
            ])->values()->all(),
        ];
    }

    public function buildGerenteDashboard(): array
    {
        $totalEstudiantes = Estudiante::count();
        $promocionesActivas = Promocion::where('activa', true)->count();
        $promocionesInactivas = Promocion::where('activa', false)->count();
        $totalPromociones = Promocion::count();
        $cursosPromocion = DB::table('promocion_curso')
            ->join('promociones', 'promociones.id', '=', 'promocion_curso.promocion_id')
            ->where('promociones.activa', true)
            ->count();
        $estudiantesConPromocion = Inscripcion::where('tipo', 'promocion')->distinct('estudiante_id')->count('estudiante_id');
        $totalCursos = Curso::count();
        $pagoPend = Inscripcion::where('monto_pagado', 0)->count();
        $inscAct = Inscripcion::where('estado', 'activo')->count();
        $nuevosMes = Inscripcion::where('creado_en', '>=', $this->startOfCurrentMonth())->count();

        return [
            'estudiantesActivos' => $totalEstudiantes,
            'promocionesActivas' => $promocionesActivas,
            'promocionesInactivas' => $promocionesInactivas,
            'totalPromociones' => $totalPromociones,
            'cursosPromocion' => $cursosPromocion,
            'estudiantesPromocion' => $estudiantesConPromocion,
            'porcentajeEstudiantesPromocion' => $totalEstudiantes > 0
                ? (int) round(($estudiantesConPromocion / $totalEstudiantes) * 100)
                : 0,
            'cursosCatalogo' => $totalCursos,
            'resumenEstudiantes' => [
                'totalRegistrados' => $totalEstudiantes,
                'pagoPendiente' => $pagoPend,
                'inscripcionesActivas' => $inscAct,
                'nuevosMes' => $nuevosMes,
            ],
        ];
    }
}
