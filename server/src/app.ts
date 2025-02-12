import propertyRouter from './routes/property';
import renterRouter from './routes/renter';
import renterExpensesRouter from './routes/renterExpenses';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/properties', propertyRouter);
app.use('/renters', renterRouter);
app.use('/renterexpenses', renterExpensesRouter);
