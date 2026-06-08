export default function AuthLayout({ children }) {
	return (
		<main className='grid min-h-screen lg:grid-cols-2'>
			<section className='hidden border-r bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between'>
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
