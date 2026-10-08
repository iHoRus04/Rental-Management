<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Đăng ký Brevo mail transport (HTTP API, không bị chặn port trên Render)
        $this->app->afterResolving(\Illuminate\Mail\MailManager::class, function (\Illuminate\Mail\MailManager $mailManager) {
            $mailManager->extend('brevo', function () {
                return new \Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoApiTransport(
                    config('services.brevo.key')
                );
            });
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') !== 'local' || str_contains(config('app.url'), 'https')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);
        
        // Share CSRF token with Inertia
        Inertia::share([
            'csrf_token' => fn () => csrf_token(),
        ]);

        // Việt hóa và tùy biến giao diện email xác thực tài khoản của Laravel
        \Illuminate\Auth\Notifications\VerifyEmail::toMailUsing(function ($notifiable, $url) {
            return (new \Illuminate\Notifications\Messages\MailMessage)
                ->subject('🔔 Kích Hoạt Tài Khoản - DreamHouse')
                ->view('emails.verify_email', compact('notifiable', 'url'));
        });
    }
}
