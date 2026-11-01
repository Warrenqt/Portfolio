import { Component, Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useFont } from '@react-three/drei/core/useFont'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { MathUtils } from 'three'
import { portfolio } from '../data/portfolio'
import { clamp01, DOCK_END, DOCK_START, easeInOutCubic, easeOutCubic, sampleLetter } from '../lib/introMotion'
import fontData from '../assets/intro-font.json'

const letters = [...portfolio.firstName]
const FlatIntro = () => <div className="intro-static display">{portfolio.firstName}</div>

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <FlatIntro /> : this.props.children }
}

function Letters({ startedAt }) {
  const font = useFont(fontData)
  const meshes = useRef([])
  const group = useRef(null)
  const seed = useRef(null)
  const destination = useRef(null)
  const { viewport, size } = useThree()
  const layout = useMemo(() => {
    let cursor = 0
    const glyphs = letters.map(letter => {
      const geometry = new TextGeometry(letter, { font, size: 1.42, depth: 0.4, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.012, bevelSegments: 2 })
      geometry.computeBoundingBox()
      const box = geometry.boundingBox
      const width = box.max.x - box.min.x
      const center = (box.min.x + box.max.x) / 2
      const targetX = cursor + center
      cursor += font.data.glyphs[letter].ha / font.data.resolution * 1.42 - 1.42 * 0.065
      geometry.center()
      return { geometry, width, targetX }
    })
    const left = glyphs[0].targetX - glyphs[0].width / 2
    const last = glyphs.at(-1)
    const right = last.targetX + last.width / 2
    const midpoint = (left + right) / 2
    return { glyphs: glyphs.map(glyph => ({ ...glyph, targetX: glyph.targetX - midpoint })), width: right - left }
  }, [font])

  // Measure the actual first line so the centered name lands in the hero.
  useLayoutEffect(() => {
    let cancelled = false
    const measure = () => {
      if (cancelled) return
      const firstLine = document.querySelector('.hero-first')
      if (!firstLine) return
      const range = document.createRange()
      range.selectNodeContents(firstLine)
      const text = range.getBoundingClientRect()
      const line = firstLine.getBoundingClientRect()
      destination.current = {
        x: (text.left + text.width / 2 - size.width / 2) * viewport.width / size.width,
        y: (size.height / 2 - line.top - line.height / 2) * viewport.height / size.height,
        scale: text.width / size.width * viewport.width / layout.width,
      }
    }
    measure()
    document.fonts?.ready.then(measure)
    return () => { cancelled = true }
  }, [size.width, size.height, viewport.width, viewport.height, layout.width])

  useFrame(() => {
    const time = (performance.now() - startedAt) / 1000
    const startScale = viewport.width * (size.width < 600 ? 0.74 : 0.56) / layout.width
    const dock = easeInOutCubic((time - DOCK_START) / (DOCK_END - DOCK_START))
    const end = destination.current
    group.current.scale.setScalar(MathUtils.lerp(startScale, end?.scale ?? startScale, dock))
    group.current.position.set((end?.x ?? 0) * dock, (end?.y ?? 0) * dock, 0)
    seed.current.position.y = -0.95 * easeOutCubic((time - 0.2) / 0.18)
    seed.current.scale.setScalar(1 - clamp01((time - 1.57) / 0.13))
    seed.current.visible = time >= 0.28 && time < 1.7

    meshes.current.forEach((mesh, index) => {
      if (!mesh) return
      const pose = sampleLetter(time, index, layout.glyphs[index].targetX)
      mesh.visible = pose.visible
      mesh.position.set(pose.x, pose.y, pose.z)
      mesh.rotation.set(pose.rotationX, pose.rotationY, pose.rotationZ)
      mesh.scale.set(pose.scale, pose.scale, pose.scale * pose.depth)
    })
  })

  return <group ref={group}>
    <mesh ref={seed} visible={false}><sphereGeometry args={[0.045, 12, 8]} /><meshBasicMaterial color="#111111" /></mesh>
    {layout.glyphs.map(({ geometry }, index) => <mesh key={index} ref={mesh => { meshes.current[index] = mesh }} geometry={geometry} visible={false}>
      <meshStandardMaterial attach="material-0" color="#171717" roughness={0.8} />
      <meshStandardMaterial attach="material-1" color="#78756f" roughness={0.55} />
    </mesh>)}
  </group>
}

export default function Intro3DLetters({ startedAt }) {
  return <SceneBoundary><div className="intro-scene" aria-hidden="true"><Canvas orthographic camera={{ position: [0, 0, 30], zoom: 100, near: 0.1, far: 100 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} fallback={<FlatIntro />}>
    <ambientLight intensity={1.4} /><directionalLight position={[-4, 6, 8]} intensity={2.4} /><directionalLight position={[3, -2, 3]} intensity={0.5} />
    <Suspense fallback={null}><Letters startedAt={startedAt} /></Suspense>
  </Canvas></div></SceneBoundary>
}
