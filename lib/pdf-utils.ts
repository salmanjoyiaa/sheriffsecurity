// Company information for PDF exports
export const COMPANY_INFO = {
  name: "Sheriff Security",
  tagline: "Professional Security Services",
  address: "Pakistan",
  phone: "+92 XXX XXXXXXX",
  email: "info@sheriffsecurity.pk",
  website: "www.sheriffsecurity.pk",
};

// Simple shield logo PNG for PDF exports
// This is a valid 48x48 PNG shield icon in dark blue
export const COMPANY_LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAA5pJREFUaIHtmU1oE1EQx/+T3dSPWj9QvHgQrCAiehFBPAgWBEEED4IX8eBB8CAIHgQPghcPggcRPAhePIgHQfAgInoRQUTw4kEQPCgiKCp+oGg/Yml2x8Nusm+TNNlsNhH6g4XszJud//+d2Z2daYAfDQAMAKsJPAFgGoCfCAIAnwD0A9AAfCZhDgA+AugmUAfA5wA/BkAnEPQB6AXwE4AHgOcA+JRAFwD1APgKcT0A+hkAPxNwGAALAPgIiJ0AFgvAUEAGABYDMD8g3gNAHwLqAqATwAQAfgsA+AAoBPwdAvITAT1AoAGgPgC6ERBLAOQHYJhBiREQH0kMB/weAvJvAH4R4IcAdAH0G4FOAJ0AvATgEYB6ALoAwBaAngCB+J6A+FQQ/xNAfwDE9wBqACAA+J8A/gPA/4cAfgH4CIAPAPQBUAJgCIBuAvYHwH8BqA2gqwjkn4D4F4LuA6IGgC4AioDwC0CdAPwNIL4D6JcE3gfAfwC6VgD6DWAJAPcDoAf+DoEQEL5C4G8A/BsIFQLoB8A/IPgIiN8B+o+EfgD6AfABqNMAtAGwCIDfANRLQNwB4BMQJxPYDyBQ+C8A+AtAficIRPdJ7AOAK0icAGALABsI7ADQIMDbAfwDAAMAbCVxGQDbCdwFYBcB2QRgKAD/ADCUhN0E+gLQD4BdBNYA6CQQdwOwjkA9ARMAsBkgCgC6g8AnAO4lMAGAOQR6ANhE4l4A+wD4D4A2Aj8C2EegLoByAJoI2EZgLYF6AqwQ4D0AmhL4hcBVBLqLhLoD/EECewH8BoA/ABgA4E8C+gF8AsA/ABwE8A8AqwiMJqAKwCMAXiSwEADxEACbAFhI4AMAvwIwn0A7gXICawAYS2A/AP8B4H8AnALgGgJzAFhJwL0AthKYQCKLhOMAjAawBsCTJIwj8BMADgLYR2AcgA8B3AvgNALbCYwj8DeAJQROA7CNwFQCHwFYBuAqEpYD2EKgH4D7AdhBYByAEwAcA+A4AtcR2ANgO4G9AGwisA+A/gA+JABC4ACAPhJLSfwK4FQC5wBYR+A4AA8A+A/AwwDsILCSxCUAHiZwJICHAFwLYC+B2QCuI3AngFMAnAHgPQD+BPAYgAMBnEPgJgB7CcwG0JPADQDuBHALgEMB3AzgQgCnADgLwP0A/ALgCAD7A3gQwJ0ArgKwH4DrAZwC4FQAZwN4H4B/ANgPwBEArgewA8AVAK4hMB/AdQD2BnACgLsA3ATgegD7AjgewO0AthE4CMBRAJ4CsAPABQCuBnAMgFMBnAfgIwD/Af7B9S/QAAAASUVORk5CYII=";

// Format currency for Pakistan
export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format date short
export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
