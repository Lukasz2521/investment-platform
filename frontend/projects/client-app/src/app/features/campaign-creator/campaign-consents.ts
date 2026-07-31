export type CampaignConsentsForm = {
  acceptRisk: boolean;
  confirmData: boolean;
  acceptNoLiability: boolean;
};

export function createDefaultCampaignConsentsForm(): CampaignConsentsForm {
  return {
    acceptRisk: false,
    confirmData: false,
    acceptNoLiability: false,
  };
}

export function isCampaignConsentsValid(form: CampaignConsentsForm): boolean {
  return form.acceptRisk && form.confirmData && form.acceptNoLiability;
}
