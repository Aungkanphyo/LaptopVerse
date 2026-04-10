import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const ProductSkeleton = () => {
  return (
    <Card className="flex flex-col justify-between overflow-hidden">
        {/* Image Skeleton */}
        <Skeleton className="aspect-video w-full rounded-none bg-gray-300 dark:bg-gray-700" />

        <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-16 bg-gray-300 dark:bg-gray-700" /> {/* Brand */}
                    <Skeleton className="h-4 w-12 bg-gray-300 dark:bg-gray-700" /> {/* Rating */}
                </div>
                <Skeleton className="h-5 w-full bg-gray-300 dark:bg-gray-700" /> {/* Title Line 1 */}
                <Skeleton className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700" />  {/* Title Line 2 */}
        </CardHeader>

        <CardContent className="p-4 pt-0 grow space-y-2 mt-2">
                <Skeleton className="h-3 w-full bg-gray-300 dark:bg-gray-700" /> {/* Specs */}
                <Skeleton className="h-3 w-5/6 bg-gray-300 dark:bg-gray-700" />
                <Skeleton className="h-3 w-4/6 bg-gray-300 dark:bg-gray-700" />
                <Skeleton className="h-6 w-24 mt-4 bg-gray-300 dark:bg-gray-700" /> {/* Price */}
        </CardContent>

        <CardFooter className="p-4 pt-0 gap-2">
                <Skeleton className="h-8 w-full bg-gray-300 dark:bg-gray-700" /> {/* Compare Btn */}
                <Skeleton className="h-8 w-full bg-gray-300 dark:bg-gray-700" /> {/* Cart Btn */}
        </CardFooter>
    </Card>
  )
}

export default ProductSkeleton
