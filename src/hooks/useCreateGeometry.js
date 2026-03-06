import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * ポリゴンメッシュ用：頂点生成関数とdepthからThree.jsのBufferGeometryを生成する。
 * 三角形の面として描画される。シェルピンスキー四面体やメンガースポンジなどに使用。
 *
 * @param {(depth: number) => number[]} generateVertices - depthを受け取り、フラットな頂点座標配列 [x,y,z, x,y,z, ...] を返す関数。3頂点ごとに1つの三角形となる。
 * @param {number} depth - フラクタルの再帰の深さ
 * @returns {THREE.BufferGeometry} 法線付きのジオメトリ
 */
export function useCreateGeometry(generateVertices, depth) {
  return useMemo(() => {
    const positions = generateVertices(depth)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.computeVertexNormals()
    return geometry
  }, [generateVertices, depth])
}

/**
 * ライン描画用：頂点生成関数とdepthからThree.jsのBufferGeometryを生成する。
 * 連続した線分として描画される。コッホ雪片やドラゴン曲線などに使用。
 *
 * @param {(depth: number) => number[]} generatePoints - depthを受け取り、フラットな頂点座標配列 [x,y,z, x,y,z, ...] を返す関数。隣接する頂点が線分で結ばれる。
 * @param {number} depth - フラクタルの再帰の深さ
 * @returns {THREE.BufferGeometry} ライン描画用のジオメトリ
 */
export function useCreateLineGeometry(generatePoints, depth) {
  return useMemo(() => {
    const positions = generatePoints(depth)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [generatePoints, depth])
}
