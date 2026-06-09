<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pago extends Model
{
    public $timestamps = false;

    protected $fillable = ['inscripcion_id', 'monto', 'fecha', 'tipo_pago', 'numero_comprobante'];

    protected $casts = [
        'monto' => 'float',
        'fecha' => 'datetime',
    ];

    public function inscripcion(): BelongsTo
    {
        return $this->belongsTo(Inscripcion::class, 'inscripcion_id');
    }
}
