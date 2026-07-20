export default function Topbar({ title, subtitle }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-1 h-8 bg-gradient-to-b from-gold to-army-green rounded-full" />
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-100 tracking-wider uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500 tracking-widest uppercase mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-gold/30 via-army-green/20 to-transparent mt-4" />
    </div>
  );
}
