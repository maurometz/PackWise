import type { ItemCategory, TripType, TransportType, WeatherType } from '@prisma/client';

export type PackingContext = {
  days: number;
  weatherType: WeatherType;
  tripType: TripType;
  transportType: TransportType;
};

export type GeneratedCategory = {
  key: ItemCategory;
  name: string;
  icon: string;
  items: { title: string; quantity: number }[];
};

export function smartPackingEngine(context: PackingContext): GeneratedCategory[] {
  const clothingFactor = context.weatherType === 'EXTREME_COLD' ? 1.4 : context.weatherType === 'BEACH_HOT' ? 1.15 : 1;
  const clothingDays = Math.max(2, Math.ceil(context.days * clothingFactor));
  const clothes = [
    { title: 'Camiseta', quantity: Math.max(2, Math.ceil(clothingDays * 0.65)) },
    { title: 'Roupa íntima', quantity: context.days + 1 },
    { title: 'Meias', quantity: context.days + 1 },
    { title: context.weatherType === 'EXTREME_COLD' ? 'Casaco térmico' : 'Casaco leve', quantity: context.weatherType === 'BEACH_HOT' ? 0 : 1 },
    { title: 'Calça ou bermuda', quantity: Math.max(2, Math.ceil(context.days / 2)) },
    { title: context.weatherType === 'BEACH_HOT' ? 'Traje de banho' : 'Pijama', quantity: 1 }
  ].filter((item) => item.quantity > 0);

  const leisure = [
    { title: 'Óculos escuros', quantity: 1 },
    ...(context.weatherType === 'BEACH_HOT' ? [{ title: 'Protetor solar', quantity: 1 }] : []),
    ...(context.transportType === 'CAR' ? [{ title: 'Documentos do veículo', quantity: 1 }] : [])
  ];

  return [
    { key: 'DOCUMENTS_RESERVATIONS', name: 'Documentos & Reservas', icon: '📄', items: [{ title: 'Documento de identificação', quantity: 1 }, { title: 'Comprovante de hospedagem', quantity: 1 }, { title: 'Seguro viagem', quantity: 1 }] },
    { key: 'CLOTHES_SHOES', name: 'Roupas & Calçados', icon: '👕', items: [...clothes, { title: 'Tênis confortável', quantity: 1 }] },
    { key: 'ELECTRONICS_ACCESSORIES', name: 'Eletrônicos & Acessórios', icon: '🔌', items: [{ title: 'Carregador do celular', quantity: 1 }, { title: 'Powerbank', quantity: 1 }, { title: 'Fones de ouvido', quantity: 1 }] },
    { key: 'HYGIENE_MEDICINE', name: 'Higiene & Farmacinha', icon: '🧴', items: [{ title: 'Remédios de uso contínuo', quantity: 1 }, { title: 'Kit primeiros socorros', quantity: 1 }, { title: 'Itens de higiene pessoal', quantity: 1 }] },
    { key: 'LEISURE_SPECIFIC', name: 'Lazer & Itens específicos', icon: '🎒', items: leisure }
  ];
}
