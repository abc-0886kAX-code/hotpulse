interface AdBannerProps {
  slot?: string
  height?: number
}

export default function AdBanner({ slot, height = 90 }: AdBannerProps) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-dashed border-[#444]"
      style={{ height: `${height}px` }}
    >
      <span className="text-sm text-[#666]">广告位 AdSense</span>
    </div>
  )
}
