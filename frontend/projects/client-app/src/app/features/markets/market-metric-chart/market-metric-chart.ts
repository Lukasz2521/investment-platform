import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-market-metric-chart',
  templateUrl: './market-metric-chart.html',
  styleUrl: './market-metric-chart.scss',
})
export class MarketMetricChart {
  readonly title = input.required<string>();
  readonly heroValue = input.required<string>();
  readonly yLabels = input.required<readonly string[]>();
  readonly xLabels = input<readonly string[]>(['00', '06', '12', '18']);
  readonly currentValues = input.required<readonly number[]>();
  readonly previousValues = input.required<readonly number[]>();
  readonly currentLegend = input.required<string>();
  readonly previousLegend = input.required<string>();
  readonly yMax = input.required<number>();

  protected readonly width = 360;
  protected readonly height = 210;
  protected readonly pad = { top: 10, right: 10, bottom: 28, left: 42 };

  protected readonly viewBox = `0 0 ${this.width} ${this.height}`;

  protected readonly gridRows = computed(() => {
    const labels = this.yLabels();
    const count = Math.max(labels.length - 1, 1);
    const plotHeight = this.height - this.pad.top - this.pad.bottom;

    return labels.map((label, index) => {
      const y = this.pad.top + (index / count) * plotHeight;
      return { label, y };
    });
  });

  protected readonly currentPath = computed(() =>
    this.toPath(this.currentValues(), this.yMax()),
  );

  protected readonly previousPath = computed(() =>
    this.toPath(this.previousValues(), this.yMax()),
  );

  protected readonly xTicks = computed(() => {
    const labels = this.xLabels();
    const plotWidth = this.width - this.pad.left - this.pad.right;

    return labels.map((label, index) => ({
      label,
      x: this.pad.left + (index / Math.max(labels.length - 1, 1)) * plotWidth,
    }));
  });

  private toPath(values: readonly number[], yMax: number): string {
    if (values.length === 0 || yMax <= 0) {
      return '';
    }

    const plotWidth = this.width - this.pad.left - this.pad.right;
    const plotHeight = this.height - this.pad.top - this.pad.bottom;

    return values
      .map((value, index) => {
        const x = this.pad.left + (index / Math.max(values.length - 1, 1)) * plotWidth;
        const y = this.pad.top + (1 - Math.min(Math.max(value, 0), yMax) / yMax) * plotHeight;
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  }
}
