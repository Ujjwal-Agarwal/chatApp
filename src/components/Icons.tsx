import { LucideProps, UserPlus } from "lucide-react";

export const Icons = {
    Logo: (props: LucideProps) => (
        <svg role="img" width={50} height={50} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google Chat</title>
            <path fill="white" d="M7.533 0a1.816 1.816 0 0 0-1.816 1.816v2.832h11.178c1.043 0 1.888.855 1.888 1.91v8.204h2.906a1.816 1.816 0 0 0 1.817-1.817V1.816A1.816 1.816 0 0 0 21.689 0H7.533zM2.311 5.148A1.816 1.816 0 0 0 .494 6.965V23.09c0 .81.979 1.215 1.55.642l3.749-3.748h10.674a1.816 1.816 0 0 0 1.816-1.816V6.965a1.816 1.816 0 0 0-1.816-1.817H2.31Z" />
        </svg>
    ),
    UserPlus
}

export type Icon = keyof typeof Icons