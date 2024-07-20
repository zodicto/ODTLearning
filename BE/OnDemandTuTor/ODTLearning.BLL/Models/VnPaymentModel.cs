﻿namespace ODTLearning.Models
{
    public class VnPaymentResponseModel
    {
        public bool Success { get; set; }
        public string PaymentMethod { get; set; }
        public string OrderDescription { get; set; }
        public string OrderId { get; set; }
        public string TransactionId { get; set; }
        public string Token { get; set; }
        public string VnPayResponseCode { get; set; }
        public float Amount { get; set; }
        public string IdAccount { get; set; }
    }

    public class VnPaymentRequestModel
    {
        public string IdAccount { get; set; }
        public string FullName { get; set; }
        public double Amount { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
