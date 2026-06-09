<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    public $timestamps = false;

    protected $fillable = ['email', 'password', 'role'];

    protected $hidden = ['password'];

    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class, 'user_id');
    }
}
