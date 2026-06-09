<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InscripcionCurso extends Model
{
    protected $table = 'inscripcion_curso';

    public $timestamps = false;

    protected $fillable = ['inscripcion_id', 'curso_id', 'nota', 'completado'];

    protected $casts = [
        'nota' => 'float',
        'completado' => 'boolean',
    ];

    public function inscripcion(): BelongsTo
    {
        return $this->belongsTo(Inscripcion::class, 'inscripcion_id');
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class, 'curso_id');
    }
}
