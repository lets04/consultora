<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inscripcion extends Model
{
    protected $table = 'inscripciones';

    public $timestamps = false;

    protected $fillable = [
        'estudiante_id', 'user_id', 'tipo', 'promocion_id',
        'modalidad', 'estado', 'monto_total', 'monto_pagado',
    ];

    protected $casts = [
        'monto_total' => 'float',
        'monto_pagado' => 'float',
        'creado_en' => 'datetime',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function promocion(): BelongsTo
    {
        return $this->belongsTo(Promocion::class, 'promocion_id');
    }

    public function cursos(): HasMany
    {
        return $this->hasMany(InscripcionCurso::class, 'inscripcion_id');
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'inscripcion_id');
    }
}
