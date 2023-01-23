enum ClockSpec {
    ClockRadius = 880,
    MinuteDotRadius = 40,
    CenterDotRadius = 120,
    HandsInnerRadius = 240,
    MinuteHandOuterRadius = 720,
    HourHandOuterRadius = 590,
    LineOuterGap = 20,
    LineThickness = 80
}

enum ClockColors {
    Hands = "#00a",
    Center = "#a00",
    Dot = "#a00",
    NumbersStroke = "gold",
    NumbersFill = "#a00"
}

interface ClockProps {
    hour: number;
    minute?: number;
}

function sanitizeHour(hour: number): number {
    return (((((hour - 1) % 12) + 12) % 12) + 1) | 0;
}

function sanitizeMinute(minute: number): number {
    return ((minute % 60) + 60) % 60 | 0;
}

function sanitizeTime(time: ClockProps): Required<ClockProps> {
    return {
        hour: sanitizeHour(time.hour),
        minute: sanitizeMinute(time.minute ?? 0)
    };
}

type Point = { x: number; y: number };

function pointOnCircle(origin: Point, radius: number, angleDeg: number) {
    const { x, y } = origin;
    const angleRad = (angleDeg / 180) * Math.PI;
    return {
        x: x + radius * Math.sin(angleRad),
        y: y - radius * Math.cos(angleRad)
    };
}

function renderClockTick(i: number): string {
    if (i % 3 === 0) {
        const { x, y } = pointOnCircle({ x: 1000, y: 1000 }, ClockSpec.ClockRadius, i * 30);

        return `
        <text
          x="${x}"
          y="${y + 75}"
          text-anchor="middle"
          font-size="200"
          style="fill:${ClockColors.NumbersFill}; stroke: ${ClockColors.NumbersStroke}; strokeWidth: 10"
        >
          ${sanitizeHour(i)}
        </text>
      `;
    }

    return `
      <circle
        style="fill: ${ClockColors.Dot}"
        transform="rotate(${i * 30},1000,1000)"
        cx="1000"
        cy="${1000 - ClockSpec.ClockRadius}"
        r="${ClockSpec.MinuteDotRadius}"
      />
    `;
}

export const svgClock = (hours: number, minutes: number) => {
    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="300"
        height="300"
        viewBox="0 0 2000 2000"
        style="fill: black"
      >
        <!-- center dot -->
        <circle
          style="fill: ${ClockColors.Center}"
          cx="1000"
          cy="1000"
          r="${ClockSpec.CenterDotRadius}"
        />
  
        <!-- hands -->
        <g
          style="stroke: ${ClockColors.Hands}; stroke-width: ${ClockSpec.LineThickness}; stroke-linecap: round"
        >
          <line
            style="opacity: 0.3"
            transform="rotate(${minutes * 6},1000,1000)"
            x1="1000"
            y1="${1000 - ClockSpec.HandsInnerRadius}"
            x2="1000"
            y2="${1000 - ClockSpec.MinuteHandOuterRadius}"
          />
          <line
            transform="rotate(${(hours + minutes / 60) * 30},1000,1000)"
            x1="1000"
            y1="${1000 - ClockSpec.HandsInnerRadius}"
            x2="1000"
            y2="${1000 - ClockSpec.HourHandOuterRadius}"
          />
        </g>
        ${Array.from({ length: 12 }, (_, i) => renderClockTick(i))}
    </svg>`
};
