import { useMemo } from "react";
import type { DataRow } from "../types/dashboard";
import AddRowForm from "../components/reusablecomponent/AddRowForm";
import BarChart from "../components/reusablecomponent/BarChart";
import ChartCard from "../components/reusablecomponent/ChartCard";
import DashboardLayout, { GridItem } from "../components/reusablecomponent/DashboardLayout";
import Graph from "../components/reusablecomponent/Graph";
import Icon from "../components/reusablecomponent/Icon";
import PieChart from "../components/reusablecomponent/PieChart";
import SettingsPanel from "../components/reusablecomponent/SettingsPanel";
import StatsCard from "../components/reusablecomponent/StatsCard";
import TableCard from "../components/reusablecomponent/TableCard";
import { userConfig as baseConfig } from "../config/userConfig";
import { userTaskFields } from "../config/userFormFields";
import { isTaskRow, nextTaskId, userData, type TaskRow, type UserData } from "../data/userData";
import { useDashboardSettings } from "../hooks/useDashboardSettings";
import { useSavedRows } from "../hooks/useSavedRows";
import { applySettings, settingsFromConfig } from "../utils/settings";


const DEFAULT_SETTINGS = settingsFromConfig(baseConfig);
const STORAGE_KEY = "dashboard-settings:user";
const ROWS_KEY = "dashboard-rows:user";

interface UserDashboardProps {
  /** enga Pass real API data later. */
  data?: UserData;
}

export default function UserDashboard({ data = userData }: UserDashboardProps) {
  const { settings, update, reset } = useDashboardSettings(STORAGE_KEY, DEFAULT_SETTINGS);
  const config = useMemo(() => applySettings(baseConfig, settings), [settings]);

  const { rows: tasks, addRow, removeRow, resetRows } = useSavedRows(ROWS_KEY, data.tasks, isTaskRow);

  const handleAddTask = (values: DataRow) => {
    const row = { id: nextTaskId(tasks), ...values };
    if (isTaskRow(row)) addRow(row);
  };

  const handleRemoveTask = (row: TaskRow) => {
    if (window.confirm(`Remove task "${row.task}" (${row.id})?`)) removeRow(row);
  };

  return (
    <DashboardLayout title={config.title} subtitle={config.subtitle} layout={config.layout}>
      <GridItem span={config.layout.columns}>
        <SettingsPanel
          settings={settings}
          onChange={update}
          onReset={reset}
          card={config.card}
          labelColor={config.layout.pageTextColor}
          accentColor={config.statsCard.iconColor}
          borderColor={config.card.borderColor}
        />
      </GridItem>

      {data.stats.map((stat) => (
        <GridItem key={stat.id} span={config.statsSpan}>
          <StatsCard
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={<Icon name={stat.icon} />}
            {...config.statsCard}
          />
        </GridItem>
      ))}

  
      <GridItem span={config.line.span}>
        <ChartCard
          title={config.line.title}
          description={config.line.description}
          {...config.card}
          {...config.line.card}
          chart={<Graph data={data.hoursByWeek} {...config.line.chart} />}
        />
      </GridItem>

      <GridItem span={config.pie.span}>
        <ChartCard
          title={config.pie.title}
          description={config.pie.description}
          {...config.card}
          {...config.pie.card}
          chart={<PieChart data={data.timeByProject} {...config.pie.chart} />}
        />
      </GridItem>

      <GridItem span={config.bar.span}>
        <ChartCard
          title={config.bar.title}
          description={config.bar.description}
          {...config.card}
          {...config.bar.card}
          chart={<BarChart data={data.tasksByDay} {...config.bar.chart} />}
        />
      </GridItem>

      <GridItem span={config.table.span}>
        <TableCard
          title={config.table.title}
          description={config.table.description}
          card={{ ...config.card, ...config.table.card }}
          table={config.table.table}
          columns={config.table.columns}
          rows={tasks}
          onRemoveRow={handleRemoveTask}
          toolbar={
            <AddRowForm
              fields={userTaskFields}
              onSubmit={handleAddTask}
              onReset={resetRows}
              buttonLabel="Add task"
              labelColor={config.card.descriptionColor}
              inputBackground={config.table.table.rowBackground}
              inputBorderColor={config.table.table.borderColor}
              inputTextColor={config.table.table.textColor}
              accentColor={config.statsCard.iconColor}
            />
          }
          getRowKey={(row) => row.id}
        />
      </GridItem>
    </DashboardLayout>
  );
}
