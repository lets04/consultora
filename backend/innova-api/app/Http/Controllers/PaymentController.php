<?php

namespace App\Http\Controllers;

use App\Models\Inscripcion;
use App\Models\Pago;
use App\Support\DateFormat;
use App\Support\PagoHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    private function mapInscripcionToStudent(Inscripcion $item): array
    {
        $total = $item->monto_total;
        $pagado = $item->monto_pagado;

        return [
            'id' => $item->id,
            'estudiante' => $item->estudiante->nombres.' '.$item->estudiante->apellidos,
            'ci' => $item->estudiante->ci,
            'curso' => $item->cursos->first()?->curso?->nombre ?? 'Sin curso',
            'fecha' => DateFormat::es($item->creado_en),
            'tipo' => '',
            'modalidad' => '',
            'total' => $total,
            'pagado' => $pagado,
            'saldo' => $total - $pagado,
            'estadoPago' => PagoHelper::status($total, $pagado),
        ];
    }

    public function getSummary(): JsonResponse
    {
        $inscriptions = Inscripcion::get(['monto_total', 'monto_pagado']);

        return response()->json([
            'pendientes' => $inscriptions->where('monto_pagado', 0)->count(),
            'parciales' => $inscriptions->filter(
                fn ($i) => $i->monto_pagado > 0 && $i->monto_pagado < $i->monto_total
            )->count(),
            'pagados' => $inscriptions->filter(
                fn ($i) => $i->monto_pagado >= $i->monto_total
            )->count(),
        ]);
    }

    public function listByFiltro(string $filtro): JsonResponse
    {
        $raw = strtolower($filtro);
        if (!in_array($raw, ['pagado', 'parcial', 'pendiente'], true)) {
            return response()->json([
                'filtro' => $filtro,
                'items' => [],
                'mensaje' => 'Filtro no reconocido. Usa pagado, parcial o pendiente.',
            ]);
        }

        $inscriptions = Inscripcion::with(['estudiante', 'cursos.curso'])
            ->orderByDesc('creado_en')
            ->get()
            ->filter(fn ($i) => PagoHelper::status($i->monto_total, $i->monto_pagado) === $raw);

        return response()->json([
            'filtro' => $raw,
            'items' => $inscriptions->map(fn ($i) => $this->mapInscripcionToStudent($i))->values(),
            'mensaje' => '',
        ]);
    }

    public function createPayment(Request $request): JsonResponse
    {
        $inscripcionId = $request->input('inscripcionId');
        $monto = $request->input('monto');
        $tipoPago = $request->input('tipoPago');
        $numeroComprobante = $request->input('numeroComprobante');

        if (!$inscripcionId || $monto === null || !$tipoPago) {
            return response()->json(['message' => 'Datos de pago incompletos'], 400);
        }

        $inscripcion = Inscripcion::find($inscripcionId);
        if (!$inscripcion) {
            return response()->json(['message' => 'Inscripción no encontrada'], 404);
        }

        if ($monto <= 0) {
            return response()->json(['message' => 'El monto debe ser mayor a 0'], 400);
        }

        $saldo = $inscripcion->monto_total - $inscripcion->monto_pagado;

        if ($inscripcion->monto_pagado >= $inscripcion->monto_total) {
            return response()->json(['message' => 'La inscripción ya está completamente pagada'], 400);
        }

        if ($monto > $saldo) {
            return response()->json(['message' => 'El monto excede el saldo pendiente'], 400);
        }

        $pago = Pago::create([
            'inscripcion_id' => $inscripcionId,
            'monto' => $monto,
            'tipo_pago' => $tipoPago,
            'numero_comprobante' => $numeroComprobante,
            'fecha' => now(),
        ]);

        $inscripcion->increment('monto_pagado', $monto);

        return response()->json($pago, 201);
    }
}
