"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { ChevronLeft, ChevronRight, Hand, Minus, Plus, RotateCcw } from "lucide-react";

type GalleryImage = { src: string; alt: string };
type Transform = { scale: number; x: number; y: number };
type Point = { x: number; y: number };

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: Point, b: Point) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function InteractiveProductGallery({ images }: { images: readonly GalleryImage[] }) {
  const [activeImage, setActiveImage] = useState(0);
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef(transform);
  const pointers = useRef(new Map<number, Point>());
  const dragStart = useRef<{ point: Point; transform: Transform } | null>(null);
  const pinchStart = useRef<{ distance: number; midpoint: Point; transform: Transform } | null>(null);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const applyTransform = useCallback((next: Transform) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const maxX = (viewport.clientWidth * (next.scale - 1)) / 2;
    const maxY = (viewport.clientHeight * (next.scale - 1)) / 2;
    const constrained = {
      scale: clamp(next.scale, MIN_SCALE, MAX_SCALE),
      x: next.scale <= 1 ? 0 : clamp(next.x, -maxX, maxX),
      y: next.scale <= 1 ? 0 : clamp(next.y, -maxY, maxY),
    };
    transformRef.current = constrained;
    setTransform(constrained);
  }, []);

  const resetView = useCallback(() => {
    pointers.current.clear();
    dragStart.current = null;
    pinchStart.current = null;
    setIsInteracting(false);
    applyTransform({ scale: 1, x: 0, y: 0 });
  }, [applyTransform]);

  const selectImage = (index: number) => {
    setActiveImage(index);
    resetView();
  };

  const moveImage = (direction: number) => {
    selectImage((activeImage + direction + images.length) % images.length);
  };

  const zoomAt = useCallback((newScale: number, clientPoint?: Point) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const current = transformRef.current;
    const scale = clamp(newScale, MIN_SCALE, MAX_SCALE);
    if (!clientPoint) {
      applyTransform({ ...current, scale });
      return;
    }
    const rect = viewport.getBoundingClientRect();
    const focalX = clientPoint.x - rect.left - rect.width / 2;
    const focalY = clientPoint.y - rect.top - rect.height / 2;
    const ratio = scale / current.scale;
    applyTransform({
      scale,
      x: focalX - (focalX - current.x) * ratio,
      y: focalY - (focalY - current.y) * ratio,
    });
  }, [applyTransform]);

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    zoomAt(transformRef.current.scale + direction * SCALE_STEP, { x: event.clientX, y: event.clientY });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsInteracting(true);
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    const activePointers = [...pointers.current.values()];

    if (activePointers.length === 1) {
      dragStart.current = { point, transform: transformRef.current };
      pinchStart.current = null;
    } else if (activePointers.length === 2) {
      pinchStart.current = {
        distance: Math.max(distance(activePointers[0], activePointers[1]), 1),
        midpoint: midpoint(activePointers[0], activePointers[1]),
        transform: transformRef.current,
      };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const activePointers = [...pointers.current.values()];

    if (activePointers.length === 2 && pinchStart.current && viewportRef.current) {
      const start = pinchStart.current;
      const currentMidpoint = midpoint(activePointers[0], activePointers[1]);
      const nextScale = clamp(
        start.transform.scale * (distance(activePointers[0], activePointers[1]) / start.distance),
        MIN_SCALE,
        MAX_SCALE,
      );
      const rect = viewportRef.current.getBoundingClientRect();
      const focalX = start.midpoint.x - rect.left - rect.width / 2;
      const focalY = start.midpoint.y - rect.top - rect.height / 2;
      const ratio = nextScale / start.transform.scale;
      applyTransform({
        scale: nextScale,
        x: focalX - (focalX - start.transform.x) * ratio + currentMidpoint.x - start.midpoint.x,
        y: focalY - (focalY - start.transform.y) * ratio + currentMidpoint.y - start.midpoint.y,
      });
      return;
    }

    if (activePointers.length === 1 && dragStart.current && transformRef.current.scale > 1) {
      const start = dragStart.current;
      applyTransform({
        ...transformRef.current,
        x: start.transform.x + activePointers[0].x - start.point.x,
        y: start.transform.y + activePointers[0].y - start.point.y,
      });
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    pinchStart.current = null;
    const remaining = [...pointers.current.values()];
    setIsInteracting(remaining.length > 0);
    dragStart.current = remaining.length === 1
      ? { point: remaining[0], transform: transformRef.current }
      : null;
  };

  return (
    <div>
      <div
        ref={viewportRef}
        className={`relative aspect-square touch-none overflow-hidden rounded-[2rem] border border-[#eadfd8] bg-white card-shadow select-none ${transform.scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onDoubleClick={() => zoomAt(transform.scale > 1 ? 1 : 2)}
        aria-label="Interactive product image. Scroll or pinch to zoom, then drag to move."
      >
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`, transition: isInteracting ? "none" : "transform 160ms ease-out" }}
        >
          <Image
            src={images[activeImage].src}
            alt={images[activeImage].alt}
            fill
            draggable={false}
            className="pointer-events-none object-contain p-5 sm:p-9"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-[#211916]/80 px-3 py-2 text-[11px] font-bold text-white backdrop-blur" aria-hidden="true">
          <Hand size={13} /> Scroll, pinch & drag
        </div>

        <div className="absolute right-4 top-4 flex items-center rounded-full border border-[#e7dcd5] bg-white/95 p-1 shadow-md" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => zoomAt(transform.scale - SCALE_STEP)} disabled={transform.scale <= MIN_SCALE} aria-label="Zoom out" className="focus-ring grid size-9 place-items-center rounded-full transition hover:bg-[#f5eeea] disabled:opacity-35"><Minus size={16} /></button>
          <span className="w-12 text-center text-[11px] font-black" aria-live="polite">{Math.round(transform.scale * 100)}%</span>
          <button type="button" onClick={() => zoomAt(transform.scale + SCALE_STEP)} disabled={transform.scale >= MAX_SCALE} aria-label="Zoom in" className="focus-ring grid size-9 place-items-center rounded-full transition hover:bg-[#f5eeea] disabled:opacity-35"><Plus size={16} /></button>
          <button type="button" onClick={resetView} disabled={transform.scale === 1 && transform.x === 0 && transform.y === 0} aria-label="Reset image view" className="focus-ring grid size-9 place-items-center rounded-full transition hover:bg-[#f5eeea] disabled:opacity-35"><RotateCcw size={15} /></button>
        </div>

        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => moveImage(-1)} aria-label="Previous product image" className="focus-ring absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-[#e7dcd5] bg-white/95 shadow-md transition hover:scale-105"><ChevronLeft size={20} /></button>
        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => moveImage(1)} aria-label="Next product image" className="focus-ring absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-[#e7dcd5] bg-white/95 shadow-md transition hover:scale-105"><ChevronRight size={20} /></button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-[#211916]/80 px-3 py-2" onPointerDown={(event) => event.stopPropagation()} aria-label={`Image ${activeImage + 1} of ${images.length}`}>
          {images.map((image, index) => (
            <button key={image.src} type="button" onClick={() => selectImage(index)} aria-label={`Show product image ${index + 1}`} className={`focus-ring h-1.5 rounded-full transition-all ${index === activeImage ? "w-6 bg-white" : "w-1.5 bg-white/45"}`} />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button key={image.src} type="button" onClick={() => selectImage(index)} aria-label={`View ${image.alt}`} className={`focus-ring relative aspect-square overflow-hidden rounded-xl border-2 bg-white transition ${index === activeImage ? "border-[#8f1d2c]" : "border-transparent hover:border-[#d6c6bc]"}`}>
            <Image src={image.src} alt="" fill className="object-contain p-1.5" sizes="140px" />
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs font-semibold text-[#7a6d66]">Mouse: scroll to zoom, then drag · Touch: pinch to zoom, then move with one finger</p>
    </div>
  );
}
