export default function AuthLayout({ children }) {
	return (
		<main className='grid min-h-screen lg:grid-cols-2'>
			<section className='hidden border-r bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between'>
				<div>
					<div className='flex items-center gap-3'>
						<span className='grid h-10 w-10 place-items-center rounded-xl bg-primary-foreground text-lg font-bold text-primary'>
							Ab
						</span>
						<div>
							<p className='font-semibold'>Atlas Tekstil</p>
							<p className='text-sm text-primary-foreground/60'>
								CRM platformasi
							</p>
						</div>
					</div>
				</div>
				<div className='max-w-lg'>
					<p className='text-4xl font-semibold tracking-tight'>
						Savdo, mijozlar va omborni bitta joydan boshqaring.
					</p>
					<p className='mt-5 text-primary-foreground/60'>
						Kiyim-kechak savdosi uchun xavfsiz va tezkor boshqaruv tizimi.
					</p>
				</div>
				<p className='text-xs text-primary-foreground/50'>
					Atlas CRM · Tashkent
				</p>
			</section>
			<section className='flex items-center justify-center p-5 sm:p-8'>
				{children}
			</section>
		</main>
	)
}
