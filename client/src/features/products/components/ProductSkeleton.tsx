import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const ProductSkeleton = () => {
  return (
    <Card className="flex flex-col justify-between overflow-hidden">
        {/* Image Skeleton */}
        <Skeleton className="aspect-video w-full rounded-none" />

        <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" /> {/* Brand */}
                    <Skeleton className="h-4 w-12" /> {/* Rating */}
                </div>
                <Skeleton className="h-5 w-full" /> {/* Title Line 1 */}
                <Skeleton className="h-5 w-3/4" />  {/* Title Line 2 */}
        </CardHeader>

        <CardContent className="p-4 pt-0 grow space-y-2 mt-2">
                <Skeleton className="h-3 w-full" /> {/* Specs */}
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
                <Skeleton className="h-6 w-24 mt-4" /> {/* Price */}
        </CardContent>

        <CardFooter className="p-4 pt-0 gap-2">
                <Skeleton className="h-8 w-full" /> {/* Compare Btn */}
                <Skeleton className="h-8 w-full" /> {/* Cart Btn */}
        </CardFooter>
    </Card>
  )
}

export default ProductSkeleton
