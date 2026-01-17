export function SiteHeader() {
  return (
    <header className='flex items-center justify-between py-6'>
      <div className='flex items-baseline gap-2'>
        <span className='text-lg font-semibold tracking-tight text-slate-900'>
          REALTEETH
        </span>
        <span className='text-sm font-medium text-slate-500'>Weather</span>
      </div>
    </header>
  );
}
