import { ReactNode } from "react"

import WarningIcon from '@mui/icons-material/WarningRounded';
import InfoIcon from '@mui/icons-material/InfoRounded';

export function DocsWarning({children}: {
    children: ReactNode
}) {
    return (
        <div className="flex flex-row gap-2 bg-[#fdff7d] dark:bg-[#676a00] text-primary-950 dark:text-primary-50 border-l-4 border-[#fbff00] p-4 mt-2 rounded-xl max-w-[75%]">
            <WarningIcon/>
            <div>
                {children}
            </div>
        </div>
    )
}

export function DocsInfo({children}: {
    children: ReactNode
}) {
    return (
        <div className="flex flex-row gap-2 bg-[#5e94eb] dark:bg-[#24529c] text-primary-950 dark:text-primary-50 border-l-4 border-[#1b6ef5] p-4 mt-2 rounded-xl max-w-[75%]">
            <InfoIcon/>
            <div>
                {children}
            </div>
        </div>
    )
}