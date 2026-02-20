import type React from 'react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const H1 = forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
	return (
		<h1
			{...props}
			ref={ref}
			className={cn(
				'scroll-m-20 text-pretty font-bold text-4xl tracking-tighter sm:text-5xl',
				props.className,
			)}
		>
			{props.children}
		</h1>
	)
})

H1.displayName = 'H1'
export { H1 }

const H2 = forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
	return (
		<h2
			{...props}
			ref={ref}
			className={cn('scroll-m-20 font-semibold text-3xl', props.className)}
		>
			{props.children}
		</h2>
	)
})

H2.displayName = 'H2'
export { H2 }

const H3 = forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
	return (
		<h3
			{...props}
			ref={ref}
			className={cn('scroll-m-20 font-semibold text-2xl', props.className)}
		>
			{props.children}
		</h3>
	)
})

H3.displayName = 'H3'
export { H3 }

const H4 = forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
	return (
		<h4
			{...props}
			ref={ref}
			className={cn('scroll-m-20 font-semibold text-xl', props.className)}
		>
			{props.children}
		</h4>
	)
})

H4.displayName = 'H4'
export { H4 }

const Lead = forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
	return (
		<p
			{...props}
			ref={ref}
			className={cn('text-muted-foreground text-xl', props.className)}
		>
			{props.children}
		</p>
	)
})

Lead.displayName = 'Lead'
export { Lead }

const P = forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
	return (
		<p {...props} ref={ref} className={cn('text-foreground', props.className)}>
			{props.children}
		</p>
	)
})

P.displayName = 'P'
export { P }

const Large = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	(props, ref) => {
		return (
			<div
				{...props}
				ref={ref}
				className={cn('font-semibold text-lg', props.className)}
			>
				{props.children}
			</div>
		)
	},
)

Large.displayName = 'Large'
export { Large }

const Small = forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
	return (
		<p
			{...props}
			ref={ref}
			className={cn('font-medium text-sm', props.className)}
		>
			{props.children}
		</p>
	)
})

Small.displayName = 'Small'
export { Small }

const Muted = forwardRef<
	HTMLSpanElement,
	React.HTMLAttributes<HTMLSpanElement>
>((props, ref) => {
	return (
		<span
			{...props}
			ref={ref}
			className={cn('text-muted-foreground text-sm', props.className)}
		>
			{props.children}
		</span>
	)
})

Muted.displayName = 'Muted'
export { Muted }

const InlineCode = forwardRef<
	HTMLSpanElement,
	React.HTMLAttributes<HTMLSpanElement>
>((props, ref) => {
	return (
		<code
			{...props}
			ref={ref}
			className={cn(
				'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm',
				props.className,
			)}
		>
			{props.children}
		</code>
	)
})

InlineCode.displayName = 'InlineCode'
export { InlineCode }

const List = forwardRef<
	HTMLUListElement,
	React.HTMLAttributes<HTMLUListElement>
>((props, ref) => {
	return (
		<ul
			{...props}
			ref={ref}
			className={cn('my-6 ml-6 list-disc [&>li]:mt-2', props.className)}
		>
			{props.children}
		</ul>
	)
})

List.displayName = 'List'
export { List }

const Quote = forwardRef<
	HTMLQuoteElement,
	React.HTMLAttributes<HTMLQuoteElement>
>((props, ref) => {
	return (
		<blockquote
			{...props}
			ref={ref}
			className={cn(
				'mt-6 border-l-2 pl-6 text-muted-foreground italic',
				props.className,
			)}
		>
			{props.children}
		</blockquote>
	)
})

Quote.displayName = 'Quote'
export { Quote }
