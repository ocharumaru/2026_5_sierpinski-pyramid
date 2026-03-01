import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * 頂点生成関数とdepthからThree.jsのBufferGeometryを生成する共通フック。
 *
 * @param {(depth: number) => number[]} generateVertices - depthを受け取り、フラットな頂点座標配列 [x,y,z, x,y,z, ...] を返す関数
 * @param {number} depth - フラクタルの再帰の深さ
 * @returns {THREE.BufferGeometry} 生成されたジオメトリ
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
