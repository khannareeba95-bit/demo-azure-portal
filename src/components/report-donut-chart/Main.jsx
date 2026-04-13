import { Chart } from '@/base-components';
import { colors } from '@/utils';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { colorScheme as colorSchemeStore } from '@/stores/color-scheme';
import { darkMode as darkModeStore } from '@/stores/dark-mode';
import { useMemo } from 'react';

function Main(props) {
  const darkMode = useRecoilValue(darkModeStore);
  const colorScheme = useRecoilValue(colorSchemeStore);
  const totalPatients = useMemo(() => {
    return props.data?.reduce((sum, item) => sum + item.count, 0) || 0;
  }, [props.data]);
  // Map the count values from props.data
  const chartData = useMemo(() => {
    const counts = props.data?.map((item) => item.count) || [];
    return [...counts, totalPatients];
  }, [props.data, totalPatients]);

  // Map the status values for labels
  const chartLabels = useMemo(() => {
    const statuses = props.data?.map((item) => item.status) || [];
    return [...statuses, 'Total Patients'];
  }, [props.data]);

  // const chartColors = () => [colors.primary(0.9), colors.pending(0.9), colors.warning(0.9)]; \
  const chartColors = () => [
    colors.success(0.9), // Green for Completed
    colors.warning(0.9), // Yellow for Pending
    colors.primary(0.9), // Blue for Total
  ];

  const data = useMemo(() => {
    return {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          backgroundColor: colorScheme ? chartColors() : '',
          hoverBackgroundColor: colorScheme ? chartColors() : '',
          borderWidth: 5,
          borderColor: darkMode ? colors.darkmode[700]() : colors.white,
        },
      ],
    };
  }, [chartData, chartLabels, colorScheme, darkMode]);

  const options = useMemo(() => {
    return {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
      },
      cutout: '80%',
    };
  }, []);

  return (
    <Chart
      type="doughnut"
      width={props.width}
      height={props.height}
      data={data}
      options={options}
      className={props.className}
    />
  );
}

Main.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string,
      count: PropTypes.number,
    })
  ),
};

Main.defaultProps = {
  width: 'auto',
  height: 'auto',
  className: '',
  data: [],
};

export default Main;
