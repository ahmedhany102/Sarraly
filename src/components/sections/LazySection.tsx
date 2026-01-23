import React, { useState, useEffect, ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';

interface LazySectionProps {
    children: ReactNode;
    /** Custom skeleton height */
    skeletonHeight?: string;
    /** Root margin for IntersectionObserver (load earlier) */
    rootMargin?: string;
    /** Fallback skeleton component */
    skeleton?: ReactNode;
    /** Fade in animation */
    animate?: boolean;
}

/**
 * LazySection - Delays rendering of children until visible in viewport.
 * Used to improve homepage performance by only loading below-the-fold sections
 * when the user scrolls near them.
 */
const LazySection: React.FC<LazySectionProps> = ({
    children,
    skeletonHeight = '300px',
    rootMargin = '200px', // Start loading 200px before visible
    skeleton,
    animate = true
}) => {
    const [hasLoaded, setHasLoaded] = useState(false);

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: rootMargin,
        triggerOnce: true, // Only trigger once
    });

    // Mark as loaded when in view
    useEffect(() => {
        if (inView && !hasLoaded) {
            setHasLoaded(true);
        }
    }, [inView, hasLoaded]);

    // Default skeleton
    const defaultSkeleton = (
        <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="min-w-[180px] rounded-lg flex-shrink-0"
                        style={{ height: skeletonHeight }}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div
            ref={ref}
            className={animate && hasLoaded ? 'animate-in fade-in duration-500' : ''}
        >
            {hasLoaded ? children : (skeleton || defaultSkeleton)}
        </div>
    );
};

export default LazySection;
