<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estudiantes', function (Blueprint $table) {
            $table->id();
            $table->string('ci')->unique();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('prefijo')->nullable();
            $table->string('profesion')->nullable();
            $table->string('telefono')->nullable();
            $table->string('email')->nullable();
            $table->string('departamento')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->string('color')->default('#2F5FD0');
        });

        Schema::create('cursos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->boolean('activo')->default(true);
            $table->foreignId('area_id')->constrained('areas')->restrictOnDelete();
            $table->unique(['nombre', 'area_id']);
        });

        Schema::create('promociones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('periodo')->default('');
            $table->boolean('activa')->default(false);
            $table->timestamp('creado_en')->useCurrent();
        });

        Schema::create('promocion_curso', function (Blueprint $table) {
            $table->foreignId('promocion_id')->constrained('promociones')->restrictOnDelete();
            $table->foreignId('curso_id')->constrained('cursos')->restrictOnDelete();
            $table->primary(['promocion_id', 'curso_id']);
        });

        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('estudiantes')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('tipo', ['promocion', 'individual'])->nullable();
            $table->foreignId('promocion_id')->nullable()->constrained('promociones')->nullOnDelete();
            $table->enum('modalidad', ['certificado', 'examen'])->nullable();
            $table->enum('estado', ['activo', 'completado', 'retirado'])->default('activo');
            $table->double('monto_total');
            $table->double('monto_pagado')->default(0);
            $table->timestamp('creado_en')->useCurrent();
        });

        Schema::create('inscripcion_curso', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscripcion_id')->constrained('inscripciones')->cascadeOnDelete();
            $table->foreignId('curso_id')->constrained('cursos')->restrictOnDelete();
            $table->double('nota')->nullable();
            $table->boolean('completado')->default(false);
            $table->unique(['inscripcion_id', 'curso_id']);
        });

        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscripcion_id')->constrained('inscripciones')->cascadeOnDelete();
            $table->double('monto');
            $table->timestamp('fecha')->useCurrent();
            $table->enum('tipo_pago', ['efectivo', 'transferencia']);
            $table->string('numero_comprobante')->nullable();
        });

        Schema::create('certificados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscripcion_id')->constrained('inscripciones')->cascadeOnDelete();
            $table->foreignId('inscripcion_curso_id')->nullable()->unique()->constrained('inscripcion_curso')->nullOnDelete();
            $table->timestamp('fecha_emision');
            $table->string('codigo')->nullable()->unique();
        });

        Schema::create('empresas', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('nombre');
            $table->string('nit')->nullable();
            $table->string('seprec')->nullable();
            $table->string('registro_ministerial')->nullable();
            $table->string('logo_url')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificados');
        Schema::dropIfExists('pagos');
        Schema::dropIfExists('inscripcion_curso');
        Schema::dropIfExists('inscripciones');
        Schema::dropIfExists('promocion_curso');
        Schema::dropIfExists('promociones');
        Schema::dropIfExists('cursos');
        Schema::dropIfExists('areas');
        Schema::dropIfExists('estudiantes');
        Schema::dropIfExists('empresas');
    }
};
