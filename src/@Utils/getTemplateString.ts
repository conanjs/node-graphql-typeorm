import ENV from "../@Config/env";

export const getChangePwdEmailTemplate = ({
    name,
    link,
}: {
    name: string;
    link: string;
}): string => {
    return `<h3>Hello <b>${name}</b></h3>
    <p>Thank you for using account recovery on my app. Just one more step..</p>
    <p>To recover your account's password, please follow this link: <a target="_" href="${link}">Link Here</a></p>
    <p><b>Cheers,</b> </p>
    <p>Your application team</p>`;
};

export const getClientChangePwdLink = ({
    token,
    userId,
}: {
    token: string;
    userId: string;
}) => {
    return `${ENV.CLIENT_ENDPOINT}/change-password?token=${token}&userId=${userId}`;
};
