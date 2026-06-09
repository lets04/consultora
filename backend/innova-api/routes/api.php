<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [HealthController::class, 'check']);

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::get('/student-portal/{ci}', [StudentController::class, 'getStudentPortalByCi']);
Route::get('/empresa', [StudentController::class, 'getEmpresa']);

Route::middleware('jwt.auth')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::middleware('role:gerente')->group(function () {
        Route::get('/admins', [AuthController::class, 'listAdmins']);
        Route::post('/admins', [AuthController::class, 'createAdmin']);
        Route::delete('/admins/{id}', [AuthController::class, 'deleteAdmin']);
        Route::get('/dashboard/gerente', [DashboardController::class, 'getGerenteDashboard']);
        Route::get('/inscriptions/by-admin', [InscriptionController::class, 'listInscriptionsByAdmin']);
        Route::put('/registro-ministerial', [StudentController::class, 'updateRegistroMinisterial']);

        Route::post('/promotions', [CatalogController::class, 'createPromotion']);
        Route::put('/promotions/{id}', [CatalogController::class, 'updatePromotion']);
        Route::put('/promotions/{id}/status', [CatalogController::class, 'updatePromotionStatus']);
        Route::delete('/promotions/{id}', [CatalogController::class, 'deletePromotion']);
        Route::post('/areas', [CatalogController::class, 'createArea']);
        Route::put('/areas/{id}', [CatalogController::class, 'updateArea']);
        Route::delete('/areas/{id}', [CatalogController::class, 'deleteArea']);
        Route::post('/cursos', [CatalogController::class, 'createCurso']);
        Route::put('/cursos/{id}', [CatalogController::class, 'updateCurso']);
        Route::delete('/cursos/{id}', [CatalogController::class, 'deleteCurso']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/dashboard/admin', [DashboardController::class, 'getAdminDashboard']);
        Route::get('/inscriptions', [InscriptionController::class, 'listInscriptions']);
        Route::post('/inscriptions', [InscriptionController::class, 'createInscription']);
        Route::put('/inscriptions/nota', [InscriptionController::class, 'updateNota']);
        Route::put('/inscriptions/modalidad', [InscriptionController::class, 'updateModalidad']);
        Route::get('/students/concluidos', [StudentController::class, 'listCompletedStudents']);
        Route::post('/students', [StudentController::class, 'createStudent']);
        Route::put('/students/{ci}', [StudentController::class, 'updateStudent']);
        Route::get('/payments/summary', [PaymentController::class, 'getSummary']);
        Route::get('/payments/{filtro}', [PaymentController::class, 'listByFiltro']);
        Route::post('/payments', [PaymentController::class, 'createPayment']);
    });

    Route::middleware('role:admin,gerente')->group(function () {
        Route::get('/students', [StudentController::class, 'listStudents']);
        Route::get('/students/{ci}', [StudentController::class, 'getStudentByCi']);
        Route::delete('/students/{ci}', [StudentController::class, 'deleteStudent']);
        Route::get('/promotions', [CatalogController::class, 'listPromotions']);
        Route::get('/areas', [CatalogController::class, 'listAreas']);
    });
});
