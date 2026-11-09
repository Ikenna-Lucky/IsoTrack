"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  MapPin,
  MousePointer2,
  Package,
  PanelsTopLeft,
  Route,
  ScanLine,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import styles from "./hero.module.css";

function TrackingSearch() {
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trackingId = value.trim().toUpperCase();
    if (!/^IST-[A-Z0-9_-]{1,60}$/.test(trackingId)) {
      setError("Enter a valid tracking ID beginning with IST-.");
      return;
    }
    router.push(`/track/${encodeURIComponent(trackingId)}`);
  }
  return (
    <form id="shipment-tracking" onSubmit={submit} className={styles.search}>
      <label htmlFor={inputId}>Expecting a delivery? Track your shipment.</label>
      <div className={styles.searchRow}>
        <ScanLine size={18} strokeWidth={1.65} aria-hidden="true" />
        <input
          id={inputId}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          placeholder="Enter your tracking ID"
          autoComplete="off"
          spellCheck={false}
          maxLength={64}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <button type="submit" aria-label="Track shipment" disabled={!value.trim()}>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p role="alert" id={`${inputId}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </form>
  );
}

function HeroStage() {
  const scene = useRef<HTMLDivElement>(null);
  const dispatch = useRef<HTMLDivElement>(null);
  const assignment = useRef<HTMLDivElement>(null);
  const tracking = useRef<HTMLDivElement>(null);
  const firstRow = useRef<HTMLDivElement>(null);
  const driver = useRef<HTMLDivElement>(null);
  const assignAction = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState({
    width: 660,
    height: 540,
    first: "",
    second: "",
    cursor: {} as CSSProperties,
  });
  const marker = useId().replaceAll(":", "");

  useEffect(() => {
    const elements = [
      scene.current,
      dispatch.current,
      assignment.current,
      tracking.current,
      firstRow.current,
      driver.current,
      assignAction.current,
    ];
    if (elements.some((element) => !element)) return;
    const measure = () => {
      const [canvas, list, assign, track, row, select, action] = elements.map((element) =>
        element!.getBoundingClientRect(),
      );
      if (!canvas || !list || !assign || !track || !row || !select || !action) return;
      const local = (rect: DOMRect) => ({
        x: rect.left - canvas.left,
        y: rect.top - canvas.top,
        width: rect.width,
        height: rect.height,
      });
      const a = local(list),
        b = local(assign),
        c = local(track);
      const mobile = window.matchMedia("(max-width: 600px)").matches;
      const outer = Math.min(a.x, b.x) - 22;
      const sourceY = a.y + a.height * 0.6,
        targetY = b.y + b.height * 0.5;
      const first = mobile
        ? `M${a.x + a.width / 2} ${a.y + a.height + 3} V${b.y - 5}`
        : `M${a.x - 2} ${sourceY} H${outer + 10} Q${outer} ${sourceY} ${outer} ${sourceY + 10} V${targetY - 10} Q${outer} ${targetY} ${outer + 10} ${targetY} H${b.x - 4}`;
      const startX = b.x + b.width + 2,
        endX = c.x - 5,
        startY = b.y + b.height * 0.5,
        endY = c.y + c.height * 0.5;
      const middle = (startX + endX) / 2;
      const second = mobile
        ? `M${b.x + b.width / 2} ${b.y + b.height + 3} V${c.y - 5}`
        : `M${startX} ${startY} C${middle} ${startY},${middle} ${endY},${endX} ${endY}`;
      const cursor = Object.fromEntries(
        [
          ["row", row],
          ["driver", select],
          ["action", action],
        ].flatMap(([name, rect]) => {
          const point = local(rect as DOMRect);
          return [
            [`--${name}-x`, `${point.x + point.width * 0.68}px`],
            [`--${name}-y`, `${point.y + point.height * 0.5}px`],
          ];
        }),
      ) as CSSProperties;
      setGeometry({ width: canvas.width, height: canvas.height, first, second, cursor });
    };
    const observer = new ResizeObserver(measure);
    elements.forEach((element) => observer.observe(element!));
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      className={styles.stage}
      aria-label="Animated sample walkthrough: dispatch rows appear, a virtual cursor chooses a shipment and assigns Tariye, then customer tracking updates."
    >
      <div className={styles.scene} ref={scene} style={geometry.cursor} aria-hidden="true">
        <div className={styles.photo}>
          <Image
            src="/images/dispatch-office.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 950px) 90vw, 55vw"
          />
        </div>
        <div ref={dispatch} className={`${styles.card} ${styles.dispatch}`}>
          <div className={styles.cardHeader}>
            <PanelsTopLeft size={17} strokeWidth={1.65} /> Dispatch{" "}
            <span className={styles.sample}>Sample data</span>
          </div>
          <div ref={firstRow} className={`${styles.row} ${styles.rowOne}`}>
            <Package size={15} strokeWidth={1.6} />
            <b>IST-K7X2M9PQ</b>
            <div className={styles.statusSlot}>
              <span className={`${styles.badge} ${styles.pending}`}>Awaiting driver</span>
              <span className={`${styles.badge} ${styles.assigned}`}>Assigned</span>
            </div>
          </div>
          <div className={`${styles.row} ${styles.rowTwo}`}>
            <Package size={15} strokeWidth={1.6} />
            <b>IST-B3N8R4PT</b>
            <span className={styles.badge} style={{ marginLeft: "auto" }}>
              In transit
            </span>
          </div>
          <div className={`${styles.row} ${styles.rowThree}`}>
            <Package size={15} strokeWidth={1.6} />
            <b>IST-W9QK7LMN</b>
            <span className={`${styles.badge} ${styles.failed}`}>Delivery failed</span>
          </div>
        </div>
        <svg className={styles.connectors} viewBox={`0 0 ${geometry.width} ${geometry.height}`}>
          <defs>
            <marker
              id={marker}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M1 1 6 4 1 7" fill="none" stroke="#2dd4bf" strokeWidth="1.4" />
            </marker>
          </defs>
          <path className={styles.connectorBase} d={geometry.first} />
          <path
            className={styles.connectorFlow}
            pathLength="1"
            d={geometry.first}
            markerEnd={`url(#${marker})`}
          />
          <path className={styles.connectorBase} d={geometry.second} />
          <path
            className={`${styles.connectorFlow} ${styles.connectorSecond}`}
            pathLength="1"
            d={geometry.second}
            markerEnd={`url(#${marker})`}
          />
        </svg>
        <div ref={assignment} className={`${styles.card} ${styles.assignment}`}>
          <div className={styles.cardHeader}>
            <UserRoundCheck size={17} strokeWidth={1.65} /> Assign a driver
          </div>
          <div className={styles.driver} ref={driver}>
            <div className="relative h-[30px] w-[30px] shrink-0 overflow-hidden rounded-full border border-white/20 min-[601px]:max-[950px]:h-[34px] min-[601px]:max-[950px]:w-[34px]">
              <Image
                src="/images/demo-driver-tariye.webp"
                alt=""
                fill
                sizes="34px"
                className="object-cover"
              />
            </div>
            <div>
              <b>Tariye Dappa</b>
              <small>Your fleet · Available</small>
            </div>
            <ChevronDown size={13} style={{ marginLeft: "auto" }} />
          </div>
          <div ref={assignAction} className={styles.assignmentState}>
            <span className={styles.choose}>
              Assign Tariye <ArrowUpRight size={12} />
            </span>
            <span className={styles.chosen}>
              <Check size={13} /> Driver assigned
            </span>
          </div>
        </div>
        <div ref={tracking} className={`${styles.card} ${styles.tracking}`}>
          <div className={styles.cardHeader}>
            <MapPin size={17} strokeWidth={1.65} /> Customer tracking
          </div>
          <div className={styles.trackingBody}>
            <div className={styles.trackingTitle}>
              IST-K7X2M9PQ <span className={styles.badge}>In transit</span>
            </div>
            <div className={styles.route}>
              <div className={styles.routeFill} />
              <span className={styles.stop} />
              <span className={`${styles.stop} ${styles.middle}`} />
              <span className={`${styles.stop} ${styles.last}`} />
            </div>
            <div className={styles.trackingFoot}>
              <strong>Ikeja → Lekki</strong>
              <Route size={15} strokeWidth={1.6} />
            </div>
          </div>
        </div>
        <div className={styles.cursor}>
          <MousePointer2 size={25} fill="#f8faf7" stroke="#111918" strokeWidth={1.5} />
        </div>
        <span className={`${styles.clickRing} ${styles.rowClick}`} />
        <span className={`${styles.clickRing} ${styles.driverClick}`} />
        <span className={`${styles.clickRing} ${styles.actionClick}`} />
      </div>
      <figcaption className={styles.stageFooter}>
        <span>Product walkthrough · Illustrative data</span>
      </figcaption>
    </figure>
  );
}

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.layout}>
        <div className={styles.copy}>
          <h1 className={styles.title} id="hero-title">
            Your drivers.
            <br />
            Your deliveries.
            <br />
            <span>One clear view.</span>
          </h1>
          <p className={styles.description}>
            Manage your private fleet, assign shipments and follow every delivery. Keep your
            customers informed, from dispatch to confirmed handover.
          </p>
          <div className={styles.actions}>
            <Link href="/register" className={styles.primary}>
              Get started <ArrowUpRight size={17} strokeWidth={1.65} aria-hidden="true" />
            </Link>
            <a href="#how-it-works" className={styles.secondary}>
              See how it works <ArrowRight size={16} strokeWidth={1.65} aria-hidden="true" />
            </a>
          </div>
          <p className={styles.note}>
            <ShieldCheck size={13} strokeWidth={1.7} aria-hidden="true" /> Your business. Your
            invited drivers.
          </p>
          <TrackingSearch />
        </div>
        <HeroStage />
      </div>
    </section>
  );
}
