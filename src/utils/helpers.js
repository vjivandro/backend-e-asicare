export function formatRange(min, max) {
  return `${min} - ${max}`;
}

export function getStatusLabel(status) {
  switch (status) {
    case "normal":
      return "Normal";
    case "menyusui_0_6":
      return "AdminMenyusui 0-6 bulan";
    case "menyusui_6_12":
      return "AdminMenyusui 6-12 bulan";
    default:
      return status;
  }
}
