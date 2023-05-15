import { cva, VariantProps } from 'class-variance-authority'
import { ButtonHTMLAttributes, FC } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
    // Default class options
    'active:scale-105 inline-flex items-center justify-center rounded-full text-sm font-medium transition-color focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    , {
        variants: {
            variant: {
                // Extra options for variants defined
                default: 'bg-gray-200 text-black hover:bg-green-500',
                ghost: 'bg-transparent hover:text-gray-200 hover:text-black hover:bg-slate-200'
            },
            size: {
                // Different sizes of buttons defined
                default: 'h-10 py-2 px-4',
                sm: 'h-9 px-2',
                lg: 'h-11 px-8'
            },
        },
        defaultVariants: {
            // Setting the default variants to be used from the above defined variants
            variant: 'default',
            size: 'default'
        },
    }
)

// ButtonHTMLAttributes allows for use of React Button parameters and VariantProps allows to use the variants defined earlier
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    isLoading?: boolean
}

// We can expand the pick the props passed. Here we pick the custom props and the rest are just let to exist in the a props variable
// The props variable will not have any of the custom defined props and will mostly use the HTMLButtonElement props extended earlier
const Button: FC<ButtonProps> = ({ className, children, variant, isLoading, size, ...props }) => {
    // We return a normal button
    // The button can be disabled by setting the isLoading state to false
    // {...props} means that the button will inherit the props defined above, it will set rest of the attributes of the button according to the props
    // className here is going to be conditional
    return <button className={cn(buttonVariants({ variant, size, className }))} disabled={isLoading} {...props}>
        {/* // If isLoading is true, we will animate the button using Loader2 icon from Lucide-react icon library else do nothing */}
        {isLoading ? <Loader2 className='mr-2 h-4 animate-spin w-4' /> : null}
        {children}
        {/* Children are the rest of stuff between the tag i.e in <button>HELLO</button>, HELLO is children */}
    </button>
}

export default Button