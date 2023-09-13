import React from "react";
import Select, {
  components,
  OptionProps,
  SingleValueProps,
} from "react-select";

import { useElectedCouncils } from "@/hooks";
import { ElectedCouncil } from "@/types";

import BlockTime from "./BlockTime";

export interface CouncilSelectProps {
  council?: ElectedCouncil;
  onChange?: (concil: ElectedCouncil | undefined) => void;
}

const SingleValue = (singleValueProps: SingleValueProps<ElectedCouncil>) => {
  const {
    data: { id },
  } = singleValueProps;

  return (
    <components.SingleValue {...singleValueProps}>{id}</components.SingleValue>
  );
};

const Option = (optionProps: OptionProps<ElectedCouncil>) => {
  const { data } = optionProps;
  return <components.Option {...optionProps}>{data.id}</components.Option>;
};

export default function CouncilSelect({
  council,
  onChange,
}: CouncilSelectProps) {
  const { data } = useElectedCouncils({});

  return (
    <div className="justify-content-center">
      <h3>Choose council </h3>
      {data ? (
        <Select
          id="council"
          className="select_input"
          isMulti={false}
          options={data}
          value={council}
          onChange={(council) =>
            onChange?.(council !== null ? council : undefined)
          }
          components={{ SingleValue, Option }}
        />
      ) : (
        <>Loading...</>
      )}
      {council && (
        <>
          <span className="time_label">
            Elected: <BlockTime block={council.electedAt} />
          </span>
          {council.endedAt && (
            <span>
              &nbsp;Ended: <BlockTime block={council.endedAt} />
            </span>
          )}
        </>
      )}
    </div>
  );
}
