ALTER TYPE "paymentMethod" ADD VALUE 'DATATRANS_CREDITCARD' AFTER 'STRIPE' ;
ALTER TYPE "paymentMethod" ADD VALUE 'DATATRANS_POSTFINANCECARD' AFTER 'DATATRANS_CREDITCARD' ;
ALTER TYPE "paymentMethod" ADD VALUE 'DATATRANS_PAYPAL' AFTER 'DATATRANS_POSTFINANCECARD' ;
ALTER TYPE "paymentMethod" ADD VALUE 'DATATRANS_TWINT' AFTER 'DATATRANS_PAYPAL' ;
