export const getProductCategory = (deliveryFormat: string): string => {
  if (['capsules', 'tablets'].includes(deliveryFormat)) return 'bottled';
  if (['sachets', 'stick-packs'].includes(deliveryFormat)) return 'flexible-single';
  if (deliveryFormat === 'pouches') return 'flexible-bulk';
  return 'other';
};

export const deliveryFormatOptions = [
  { value: 'capsules', label: 'Capsules (two-piece shell)', description: 'Best for botanicals, probiotics, fish oils' },
  { value: 'tablets', label: 'Tablets (compressed solid dose)', description: 'Ideal for vitamins, minerals, chewables, effervescents' },
  { value: 'sachets', label: 'Sachets (single-serve packets)', description: 'Perfect for drink mixes, electrolytes, collagen' },
  { value: 'stick-packs', label: 'Stick Packs (slim tubes)', description: 'Great for energy powders, sleep aids, DTC brands' },
  { value: 'pouches', label: 'Resealable Bags (multi-serve)', description: 'Optimal for protein powders, bulk supplements, greens' },
];

export const capsuleTypeOptions = [
  { value: 'hpmc', label: 'HPMC (Veggie)' },
  { value: 'gelatin', label: 'Gelatin' },
  { value: 'pullulan', label: 'Pullulan' },
  { value: 'delayed-release', label: 'Delayed Release' },
  { value: 'other', label: 'Other' },
];

export const tabletTypeOptions = [
  { value: 'compressed', label: 'Compressed' },
  { value: 'chewable', label: 'Chewable' },
  { value: 'effervescent', label: 'Effervescent' },
  { value: 'coated', label: 'Film Coated' },
  { value: 'enteric-coated', label: 'Enteric Coated' },
  { value: 'other', label: 'Other' },
];

export const unitsPerBoxOptions = [
  { value: '7', label: '7 count' },
  { value: '10', label: '10 count' },
  { value: '14', label: '14 count' },
  { value: '20', label: '20 count' },
  { value: '30', label: '30 count' },
  { value: '60', label: '60 count' },
  { value: 'other', label: 'Other' },
];

export const pouchVolumeOptions = [
  { value: '100g', label: '100g' },
  { value: '250g', label: '250g' },
  { value: '500g', label: '500g' },
  { value: '1kg', label: '1kg' },
  { value: '2kg', label: '2kg' },
  { value: '5kg', label: '5kg' },
  { value: 'other', label: 'Other' },
];

export const pouchSizeOptions = [
  { value: 'undecided', label: 'Undecided' },
  { value: '4x6', label: '4" × 6"' },
  { value: '6x9', label: '6" × 9"' },
  { value: '8x12', label: '8" × 12"' },
  { value: '10x14', label: '10" × 14"' },
  { value: 'other', label: 'Other' },
];

export const bottleTypeOptions = [
  { value: 'undecided', label: 'Undecided' },
  { value: 'hdpe', label: 'HDPE' },
  { value: 'pet', label: 'PET' },
  { value: 'glass', label: 'Glass' },
  { value: 'other', label: 'Other' },
];

export const bottleSizeOptions = [
  { value: 'undecided', label: 'Undecided' },
  { value: '75cc', label: '75cc' },
  { value: '100cc', label: '100cc' },
  { value: '120cc', label: '120cc' },
  { value: '150cc', label: '150cc' },
  { value: '175cc', label: '175cc' },
  { value: '200cc', label: '200cc' },
  { value: '250cc', label: '250cc' },
  { value: 'other', label: 'Other' },
];

export const bottleColorOptions = [
  { value: 'undecided', label: 'Undecided' },
  { value: 'white', label: 'White' },
  { value: 'amber', label: 'Amber' },
  { value: 'clear', label: 'Clear' },
  { value: 'black', label: 'Black' },
  { value: 'cobalt-blue', label: 'Cobalt Blue' },
  { value: 'other', label: 'Other' },
];

export const lidTypeOptions = [
  { value: 'undecided', label: 'Undecided' },
  { value: 'crc', label: 'CRC (Child Resistant)' },
  { value: 'flip-top', label: 'Flip Top' },
  { value: 'screw-cap', label: 'Screw Cap' },
  { value: 'tamper-evident', label: 'Tamper Evident' },
  { value: 'other', label: 'Other' },
];

export const lidColorOptions = [
  { value: 'undecided', label: 'Undecided' },
  { value: 'white', label: 'White' },
  { value: 'black', label: 'Black' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'natural', label: 'Natural' },
  { value: 'other', label: 'Other' },
];

export const materialTypeOptions = [
  { value: 'undecided', label: 'Undecided' },
  { value: 'foil-laminate', label: 'Foil Laminate' },
  { value: 'kraft-paper', label: 'Kraft Paper' },
  { value: 'matte-film', label: 'Matte Film' },
  { value: 'glossy-film', label: 'Glossy Film' },
  { value: 'clear-film', label: 'Clear Film' },
  { value: 'other', label: 'Other' },
];

export const closureTypeOptions = [
  { value: 'undecided', label: 'Undecided' },
  { value: 'zip-lock', label: 'Zip-Lock' },
  { value: 'tear-notch', label: 'Tear Notch' },
  { value: 'spout-cap', label: 'Spout Cap' },
  { value: 'heat-seal', label: 'Heat Seal Only' },
  { value: 'other', label: 'Other' },
];
