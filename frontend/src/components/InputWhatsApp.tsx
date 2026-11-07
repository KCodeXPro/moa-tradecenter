interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function InputWhatsApp({ value, onChange }: Props) {
  // Si el valor ya tiene +53, lo limpiamos para mostrar solo el número
  const numero = value.replace('+53', '').trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo números
    let nuevoNumero = e.target.value.replace(/\D/g, '');

    // 🔥 Limitar a 8 dígitos máximo
    if (nuevoNumero.length > 8) {
      nuevoNumero = nuevoNumero.slice(0, 8);
    }

    // 🔥 El primer dígito debe ser 5 o 6 (móvil cubano)
    if (nuevoNumero.length > 0 && !['5', '6'].includes(nuevoNumero[0])) {
      return; // No actualizamos si el primer dígito no es válido
    }

    onChange(`+53${nuevoNumero}`);
  };

  return (
    <div className="flex w-full">
      <div className="flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 border border-r-0 border-[#D9D4CC] rounded-l-[10px] px-3 font-semibold text-[#6B6B6B]">
        🇨🇺 +53
      </div>
      <input
        type="tel"
        value={numero}
        onChange={handleChange}
        placeholder="5XXXXXXX (8 dígitos)"
        maxLength={8}
        className="w-full px-3 py-2 rounded-r-[10px] border border-[#D9D4CC] focus:border-[#A63A2B] outline-none"
      />
    </div>
  );
}