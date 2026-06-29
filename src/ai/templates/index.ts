import type { BusinessData } from "./plumber";
import { renderPlumber } from "./plumber";
import { renderRoofer } from "./roofer";
import { renderHvac } from "./hvac";
import { renderDentist } from "./dentist";
import { renderElectrician } from "./electrician";
import { renderLandscaper } from "./landscaper";
import { renderGeneric } from "./generic";

type TemplateFn = (data: BusinessData) => string;

const templateRegistry: Record<string, TemplateFn> = {
  plumber: renderPlumber,
  roofer: renderRoofer,
  hvac: renderHvac,
  heating: renderHvac,
  cooling: renderHvac,
  dentist: renderDentist,
  dental: renderDentist,
  electrician: renderElectrician,
  electrical: renderElectrician,
  landscaper: renderLandscaper,
  landscaping: renderLandscaper,
  lawn: renderLandscaper,
  generic: renderGeneric,
};

export function getTemplate(industry: string): TemplateFn {
  const key = industry.toLowerCase().trim();
  return templateRegistry[key] || renderGeneric;
}

export { type BusinessData } from "./plumber";