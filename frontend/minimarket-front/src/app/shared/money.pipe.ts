import { Pipe, PipeTransform } from '@angular/core';

const formatters = new Map<string, Intl.NumberFormat>();

@Pipe({ name: 'money', standalone: true })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined, currency = 'EUR'): string {
    if (value === null || value === undefined) return '';
    let f = formatters.get(currency);
    if (!f) {
      f = new Intl.NumberFormat('fr-FR', { style: 'currency', currency });
      formatters.set(currency, f);
    }
    return f.format(value);
  }
}
