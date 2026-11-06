interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function InputWhatsApp({ value, onChange }: Props) {
  // Si el valor ya tiene +53, lo limpiamos para mostrar solo el número
  const numero = value.replace('+53', '').trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoNumero = e.target.value.replace(/\D/g, ''); // Solo números
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
        placeholder="5XXXXXXX"
        className="w-full px-3 py-2 rounded-r-[10px] border border-[#D9D4CC] focus:border-[#A63A2B] outline-none"
      />
    </div>
  );
}