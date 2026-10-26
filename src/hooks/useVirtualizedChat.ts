"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChatMessage } from "../types/chat";

interface UseVirtualizedChatProps {
  messages: ChatMessage[];
  estimatedItemHeight?: number;
  overscanPx?: number;
}

export function useVirtualizedChat({
  messages,
  estimatedItemHeight = 68,
  overscanPx = 400,
}: UseVirtualizedChatProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const heightCache = useRef<Map<string, number>>(new Map());
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);
  const isNearBottomRef = useRef(true);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const prevMessagesLengthRef = useRef(messages.length);

  // ResizeObserver on container to track viewport height
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setViewportHeight(el.clientHeight);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportHeight(entry.contentRect.height);
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure an item when rendered
  const measureItem = useCallback((id: string, el: HTMLElement | null) => {
    if (!el) return;
    const height = el.getBoundingClientRect().height;
    if (height > 0 && heightCache.current.get(id) !== height) {
      heightCache.current.set(id, height);
    }
  }, []);

  // Compute positions and visible range of messages
  const { offsets, totalHeight, startIndex, endIndex } = useMemo(() => {
    const count = messages.length;
    if (count === 0) {
      return { offsets: [], totalHeight: 0, startIndex: 0, endIndex: 0 };
    }

    const calculatedOffsets = new Array<number>(count);
    let currentOffset = 0;

    for (let i = 0; i < count; i++) {
      calculatedOffsets[i] = currentOffset;
      const msg = messages[i];
      const h =
        heightCache.current.get(msg.id) ||
        (msg.senderType === "system" ? 44 : estimatedItemHeight);
      currentOffset += h;
    }

    const total = currentOffset;

    // Determine visible window with overscan
    const visibleTop = Math.max(0, scrollTop - overscanPx);
    const visibleBottom = scrollTop + viewportHeight + overscanPx;

    let start = 0;
    while (
      start < count - 1 &&
      calculatedOffsets[start] +
        (heightCache.current.get(messages[start].id) || estimatedItemHeight) <
        visibleTop
    ) {
      start++;
    }

    let end = start;
    while (end < count - 1 && calculatedOffsets[end] <= visibleBottom) {
      end++;
    }

    return {
      offsets: calculatedOffsets,
      totalHeight: total,
      startIndex: Math.max(0, start),
      endIndex: Math.min(count - 1, end),
    };
  }, [messages, scrollTop, viewportHeight, estimatedItemHeight, overscanPx]);

  const topSpacerHeight = offsets[startIndex] || 0;
  const bottomSpacerHeight = useMemo(() => {
    if (messages.length === 0 || endIndex >= messages.length - 1) return 0;
    const lastItemHeight =
      heightCache.current.get(messages[endIndex].id) || estimatedItemHeight;
    const endPosition = (offsets[endIndex] || 0) + lastItemHeight;
    return Math.max(0, totalHeight - endPosition);
  }, [messages, endIndex, offsets, totalHeight, estimatedItemHeight]);

  const visibleMessages = useMemo(() => {
    if (messages.length === 0) return [];
    return messages.slice(startIndex, endIndex + 1);
  }, [messages, startIndex, endIndex]);

  // Handle scroll events with requestAnimationFrame throttling for 60+ FPS
  const rafIdRef = useRef<number | null>(null);
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

    rafIdRef.current = requestAnimationFrame(() => {
      const top = el.scrollTop;
      setScrollTop(top);

      const distanceToBottom = el.scrollHeight - top - el.clientHeight;
      const nearBottom = distanceToBottom <= 120;
      isNearBottomRef.current = nearBottom;
      setShowScrollBottomBtn(!nearBottom);
    });
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
    isNearBottomRef.current = true;
    setShowScrollBottomBtn(false);
  }, []);

  // When new messages arrive
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const lastMsg = messages[messages.length - 1];
      const isMyMessage = lastMsg?.senderType === "you";

      // If user is near bottom OR user just sent a message, auto-scroll down
      if (isNearBottomRef.current || isMyMessage) {
        requestAnimationFrame(() => {
          scrollToBottom(true);
        });
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, scrollToBottom]);

  // Reset scroll to bottom on initial mount or when messages reset (e.g. new partner)
  useEffect(() => {
    if (messages.length <= 1) {
      heightCache.current.clear();
      requestAnimationFrame(() => {
        scrollToBottom(false);
      });
    }
  }, [messages.length, scrollToBottom]);

  return {
    containerRef,
    messagesEndRef,
    visibleMessages,
    startIndex,
    topSpacerHeight,
    bottomSpacerHeight,
    measureItem,
    handleScroll,
    scrollToBottom,
    showScrollBottomBtn,
  };
}
