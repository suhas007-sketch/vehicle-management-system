import React from 'react';
import { Skeleton } from './Skeleton';
import { Card, CardContent } from './Card';

export const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-border/40 bg-surface-dark/40 overflow-hidden relative">
                <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <Skeleton className="h-14 w-14 rounded-2xl opacity-20" />
                        <Skeleton className="h-6 w-12 rounded-lg opacity-20" />
                    </div>
                    <Skeleton className="h-3 w-24 mb-2 opacity-10" />
                    <Skeleton className="h-9 w-32 opacity-20" />
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-transparent to-transparent" />
            </Card>
        ))}
    </div>
);

export const VehicleCardSkeleton = () => (
    <Card className="border-border/40 bg-surface-dark/40 overflow-hidden rounded-[32px]">
        <Skeleton className="h-48 w-full rounded-none opacity-20 shadow-inner" />
        <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-3 w-1/4 opacity-10" />
                <Skeleton className="h-6 w-3/4 opacity-20" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-lg opacity-10" />
                <Skeleton className="h-6 w-16 rounded-lg opacity-10" />
            </div>
            <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16 opacity-10" />
                    <Skeleton className="h-7 w-24 opacity-20" />
                </div>
                <Skeleton className="h-10 w-24 rounded-2xl opacity-20" />
            </div>
        </CardContent>
    </Card>
);

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
    <div className="overflow-x-auto rounded-[32px] border border-white/5 bg-surface-dark/40">
        <table className="w-full">
            <thead className="bg-surface border-b border-white/10">
                <tr>
                    {Array.from({ length: cols }).map((_, i) => (
                        <th key={i} className="p-6 text-left"><Skeleton className="h-4 w-24 opacity-10" /></th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {Array.from({ length: rows }).map((_, i) => (
                    <tr key={i}>
                        {Array.from({ length: cols }).map((_, j) => (
                            <td key={j} className="p-6"><Skeleton className="h-4 w-full opacity-10 rounded-full" /></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const ChartSkeleton = () => (
    <Card className="border-border/40 bg-surface-dark/40 overflow-hidden rounded-[32px]">
        <div className="p-8 border-b border-border/20 flex justify-between">
            <div className="space-y-2">
                <Skeleton className="h-6 w-48 opacity-20" />
                <Skeleton className="h-3 w-32 opacity-10" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl opacity-20" />
        </div>
        <CardContent className="p-8 h-[350px] flex items-end justify-between gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 space-y-4">
                    <Skeleton className="w-full opacity-10 rounded-t-xl" style={{ height: `${20 + Math.random() * 60}%` }} />
                    <Skeleton className="h-3 w-full opacity-10" />
                </div>
            ))}
        </CardContent>
    </Card>
);

export const DashboardSkeleton = () => (
    <div className="space-y-12 animate-pulse">
        <div className="flex justify-between items-end">
            <div className="space-y-4">
                <Skeleton className="h-4 w-48 opacity-20" />
                <Skeleton className="h-16 w-96 opacity-30" />
            </div>
            <Skeleton className="h-20 w-48 rounded-[32px] opacity-20" />
        </div>
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
                <Skeleton className="h-[600px] w-full rounded-[48px] opacity-10" />
            </div>
            <div className="space-y-10">
                <Skeleton className="h-64 w-full rounded-[48px] opacity-20" />
                <Skeleton className="h-64 w-full rounded-[48px] opacity-20" />
            </div>
        </div>
    </div>
);
