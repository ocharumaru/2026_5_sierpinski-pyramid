import { useState, useRef, useEffect } from 'react'

/**
 * フラクタルのステップアニメーションを制御する共通フック。
 * currentDepth を 0 から targetDepth まで stepInterval(ms) ごとに +1 する。
 *
 * @param {number} targetDepth - 目標の再帰の深さ
 * @param {number} stepInterval - 各ステップの間隔（ミリ秒）
 * @returns {{ currentDepth: number, isPlaying: boolean, isFinished: boolean, start: () => void, pause: () => void, resume: () => void, reset: () => void }}
 */
export function useFractalAnimation(targetDepth, stepInterval) {
  const [currentDepth, setCurrentDepth] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef(null)
  const targetRef = useRef(targetDepth)

  // targetDepth の最新値を ref で保持（タイマーコールバック内で参照するため）
  useEffect(() => {
    targetRef.current = targetDepth
  }, [targetDepth])

  const isFinished = currentDepth >= targetDepth

  // isPlaying の変化に応じてタイマーを管理
  useEffect(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentDepth((prev) => {
          const next = prev + 1
          if (next >= targetRef.current) {
            // 目標に到達したらタイマー停止
            clearInterval(timerRef.current)
            timerRef.current = null
            setIsPlaying(false)
            return targetRef.current
          }
          return next
        })
      }, stepInterval)
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, stepInterval])

  /** depth を 0 にリセットし、ステップアニメーションを開始する */
  const start = () => {
    setCurrentDepth(0)
    setIsPlaying(true)
  }

  /** アニメーションを一時停止する */
  const pause = () => {
    setIsPlaying(false)
  }

  /** 一時停止中のアニメーションを再開する */
  const resume = () => {
    if (currentDepth < targetDepth) {
      setIsPlaying(true)
    }
  }

  /** depth を 0 に戻してアニメーションを停止する */
  const reset = () => {
    setCurrentDepth(0)
    setIsPlaying(false)
  }

  return { currentDepth, isPlaying, isFinished, start, pause, resume, reset }
}
