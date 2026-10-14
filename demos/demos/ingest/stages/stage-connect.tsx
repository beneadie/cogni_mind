"use client";

import { useMemo } from "react";
import { AgentStream } from "../components/agent-stream";
import { ConnectionsGrid } from "../components/connections-grid";
import { StageLayout } from "../components/stage-layout";
import { PlanCard } from "../components/plan-card";
import { Reveal } from "../components/reveal";
import { SystemMap } from "../components/system-map";
import { useAgentPlayer } from "../components/use-agent-player";
import type { PlayerStep } from "../lib/types";

export function StageConnect({ stageIndex }: { stageIndex: number }) {
  const steps = useMemo<PlayerStep[]>(
    () => [
      {
        kind: "thought",
        text: "Before anything can be normalised, I have to reach the data — and it lives in eight systems that have never spoken to each other.",
      },
      {
        kind: "action",
        label: "Authenticating with Salesforce",
        flash: "oauth: salesforce.sobjects.query(SOQL)",
        result: "OAuth OK",
        ms: 850,
      },
      {
        kind: "action",
        label: "Pulling the Salesforce CPQ catalog",
        flash: "SELECT Id, Name, Family FROM Product2",
        result: "761 rows",
        ms: 1000,
      },
      {
        kind: "action",
        label: "Reading the SAP S/4HANA material master",
        flash: "GET /sap/opu/odata/.../A_Material",
        result: "683 rows",
        ms: 1000,
      },
      {
        kind: "action",
        label: "Querying Epicor Eclipse over ODBC",
        flash: "SELECT * FROM ERP.ITEMMST",
        result: "630 rows",
        ms: 1000,
      },
      {
        kind: "action",
        label: "Reaching the AS/400 DB2 table",
        flash: "SELECT * FROM NWLIB.ITEMFILE",
        result: "708 rows",
        ms: 1000,
      },
      {
        kind: "action",
        label: "Pulling the supplier workbook from SharePoint",
        flash: "graph.drive.items['catalog.xlsx']",
        result: "521 rows",
        ms: 1000,
      },
      {
        kind: "action",
        label: "Parsing the supplier EDI 832 feed",
        flash: "parse_edi_832('832_0891.edi')",
        result: "570 rows",
        ms: 1000,
      },
      {
        kind: "action",
        label: "Linking NetSuite and HubSpot for context",
        flash: "netsuite + hubspot",
        result: "linked",
        ms: 850,
      },
      {
        kind: "note",
        tone: "good",
        text: "Six catalogs landed raw in one place — Salesforce clean, SAP cryptic, AS/400 in ALL-CAPS, EDI in German. Now the real work begins.",
      },
    ],
    [],
  );

  const player = useAgentPlayer(steps, { autoStart: true });

  return (
    <StageLayout
      artifactLabel="Integrations · connected live"
      stream={
        <AgentStream
          steps={steps}
          revealed={player.revealed}
          running={player.running}
          header={<PlanCard current={stageIndex} />}
        />
      }
      artifact={
        <div className="space-y-3">
          <Reveal show={player.revealed >= 1}>
            <ConnectionsGrid revealed={player.revealed} running={player.running} />
          </Reveal>
          <Reveal show={player.status === "done"} delay={0.05}>
            <SystemMap />
          </Reveal>
        </div>
      }
    />
  );
}
