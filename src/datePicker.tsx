import * as React from "react";
import * as moment from "jalali-moment";
import * as Icons from "./icons";
import MaskedInput from "react-text-mask";
import { IDatePickerTheme } from "./types";
import { Moment } from "jalali-moment";
import { daysInMonth, IDays } from "./utils/daysInMonth";
import styled, { defaultDatePickerTheme } from "./theme";
import { Modal } from "./modal";
import { Days } from "./days";
import { datePickerStatus } from "./utils/rangeHelper";
import {
  formatDate,
  formatDateTime,
  formatJalaliDate,
  inputFaDateMask,
  inputFaDateWithTimeMask,
} from "./utils";

interface IDatePickerProps {
  value: number | Date | Moment;
  ArrowLeft?: React.ReactType;
  ArrowRight?: React.ReactType;
  ClockIcon?: React.ReactType;
  DateIcon?: React.ReactType;
  modalZIndex?: number;
  theme?: IDatePickerTheme;
  weekend?: number[];
  isRenderingButtons?: boolean;
  timePicker?: boolean;
  onClickSubmitButton?: (arg: any) => any;
}

interface IDatePickerState {
  value: Moment;
  cloneDays: Moment;
  initialValue?: Moment;
  monthName?: string;
  days?: IDays[];
  isOpenModal: boolean;
  dayStatus: string;
  timePickerView: boolean;
}

const DatePickerDiv = styled.div`
  direction: rtl;
`;

export class DatePicker extends React.PureComponent<
  IDatePickerProps,
  IDatePickerState
> {
  public static defaultProps: Partial<IDatePickerProps> = {
    value: moment(),
    timePicker: true,
    ArrowRight: Icons.ArrowRightCMP,
    ArrowLeft: Icons.ArrowLeftCMP,
    modalZIndex: 9999,
    theme: defaultDatePickerTheme,
    weekend: [6],
    DateIcon: Icons.DateIcon,
    ClockIcon: Icons.ClockIcon,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: moment(this.props.value),
      cloneDays: moment(this.props.value),
      monthName: "",
      days: [],
      isOpenModal: false,
      timePickerView: false,
      dayStatus: datePickerStatus(moment(this.props.value)),
    };
  }

  public componentDidMount(): void {
    const { monthName, days } = daysInMonth(this.state.cloneDays);
    this.setState(prevState => {
      return {
        days: [...prevState.days, ...days],
        monthName,
        initialValue: prevState.value,
      };
    });
  }
  public componentDidUpdate(
    prevProps: Readonly<IDatePickerProps>,
    prevState: Readonly<IDatePickerState>,
  ): void {
    if (!prevState.value.isSame(this.state.value)) {
      this.setState({
        dayStatus: datePickerStatus(moment(this.state.value)),
      });
    }
    if (!prevState.cloneDays.isSame(this.state.cloneDays)) {
      const { monthName, days } = daysInMonth(this.state.cloneDays);
      this.setState(prevSetState => {
        return {
          days: [...prevSetState.days.slice(prevSetState.days.length), ...days],
          monthName,
        };
      });
    }
  }

  public changeMonth = amount => {
    this.setState(prevState => {
      return {
        cloneDays: prevState.cloneDays.clone().add(amount, "month"),
      };
    });
  };
  public toggleModalOpen = () => {
    this.setState(prevState => {
      return {
        isOpenModal: !prevState.isOpenModal,
      };
    });
  };
  public toggleTimePickerView = () => {
    this.setState(prevState => {
      return {
        timePickerView: !prevState.timePickerView,
      };
    });
  };
  public selectDay = (e: React.SyntheticEvent<EventTarget>) => {
    const { fadate } = (e.target as HTMLHtmlElement).dataset;
    this.setState({
      value: formatJalaliDate(fadate),
    });
  };
  public daysEventListeners = () => {
    return {
      onClick: this.selectDay,
    };
  };
  public cancelButton = () => {
    this.setState(prevState => ({
      isOpenModal: false,
      value: prevState.initialValue,
    }));
  };
  public submitButton = () => {
    const { value } = this.state;
    if (this.props.onClickSubmitButton) {
      this.props.onClickSubmitButton({
        value,
      });
    }
    this.setState({
      isOpenModal: false,
      initialValue: this.state.value,
    });
  };
  public render(): React.ReactNode {
    const {
      modalZIndex,
      ArrowRight,
      ArrowLeft,
      DateIcon,
      ClockIcon,
      theme,
      timePicker,
    } = this.props;
    return (
      <DatePickerDiv>
        <MaskedInput
          className="dp__input"
          data-testid="input-dp"
          value={this.state.value.format(
            timePicker ? formatDateTime : formatDate,
          )}
          mask={timePicker ? inputFaDateWithTimeMask : inputFaDateMask}
          onClick={this.toggleModalOpen}
          style={{ direction: "ltr" }}
        />
        <Modal
          isOpen={this.state.isOpenModal}
          toggleOpen={this.toggleModalOpen}
          modalZIndex={modalZIndex}
        >
          <Days
            days={this.state.days}
            monthName={this.state.monthName}
            selectedPickerStatus={this.state.dayStatus}
            selectedDay={this.state.value.format("jYYYY/jMM/jDD")}
            daysEventListeners={this.daysEventListeners}
            holiday={this.props.weekend}
            theme={theme}
            isRenderingButtons={true}
            ArrowLeft={ArrowLeft}
            ArrowRight={ArrowRight}
            DateIcon={DateIcon}
            ClockIcon={ClockIcon}
            increaseMonth={() => this.changeMonth(1)}
            decreaseMonth={() => this.changeMonth(-1)}
            toggleView={this.toggleTimePickerView}
            timePickerView={this.state.timePickerView}
            onCancelButton={this.cancelButton}
            onSubmitButton={this.submitButton}
            timePicker
          />
        </Modal>
      </DatePickerDiv>
    );
  }
}
