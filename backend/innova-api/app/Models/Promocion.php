<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promocion extends Model
{
    protected $table = 'promociones';

    public $timestamps = false;

    protected $fillable = ['nombre', 'periodo', 'activa'];

    protected $casts = [
        'activa' => 'boolean',
        'creado_en' => 'datetime',
    ];

    public function cursos(): BelongsToMany
    {
        return $this->belongsToMany(Curso::class, 'promocion_curso', 'promocion_id', 'curso_id');
    }

    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class, 'promocion_id');
    }
}
