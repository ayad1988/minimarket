import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthError, AuthService } from '../../core/auth/auth.service';
import { safeReturnUrl } from '../../core/auth/return-url';

const sameAsPassword = (c: AbstractControl): ValidationErrors | null =>
  c.get('password')?.value === c.get('confirm')?.value ? null : { mismatch: true };

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: '../auth-form.scss',
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  returnUrl = safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
  loginLink = ['/login'];

  form = inject(FormBuilder).nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    confirm: ['', Validators.required],
  }, { validators: sameAsPassword });

  loading = signal(false);
  error = signal<string | null>(null);
  serverFields = signal<Record<string, string>>({});
  showPassword = signal(false);

  get passwordMismatch() {
    return this.form.hasError('mismatch') && this.form.controls.confirm.touched;
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);
    this.serverFields.set({});
    const { firstName, lastName, email, password } = this.form.getRawValue();
    try {
      await this.auth.register({ firstName, lastName, email, password });
      await this.router.navigateByUrl(this.returnUrl);
    } catch (e) {
      if (e instanceof AuthError) {
        this.error.set(e.message);
        this.serverFields.set(e.fields);
      } else {
        this.error.set("L'inscription a échoué.");
      }
    } finally {
      this.loading.set(false);
    }
  }
}
