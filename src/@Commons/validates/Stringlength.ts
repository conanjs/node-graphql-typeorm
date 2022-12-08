import { ErrorField } from "../types/ErrorField";

export const minStringLength = (
    value: string,
    lengthToValidate: number,
    fieldName: string
): ErrorField | null => {
    const noun = lengthToValidate - 1 > 1 ? "characters" : "character";
    if (value.length < lengthToValidate) {
        throw new ErrorField(
            fieldName,
            `${fieldName} must be greater than ${lengthToValidate - 1} ${noun}`
        );
    }
    return;
};

export const maxStringLength = (
    value: string,
    lengthToValidate: number,
    fieldName: string
): ErrorField | null => {
    const noun = lengthToValidate + 1 > 1 ? "characters" : "character";
    if (value.length > lengthToValidate) {
        throw new ErrorField(
            fieldName,
            `${fieldName} must be less than ${lengthToValidate + 1} ${noun}`
        );
    }
    return;
};
